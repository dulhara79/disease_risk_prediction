# preprocessor.py

import joblib
import pandas as pd
import numpy as np
import json
from pathlib import Path
from config import (
    FINAL_MODEL_PATH, STANDARD_SCALER_PATH, ORDINAL_ENCODER_PATH, ONE_HOT_ENCODER_PATH,
    KNN_IMPUTER_PATH, PCA_TRANSFORMER_PATH, FINAL_FEATURES_LIST_PATH,
    KNN_IMPUTE_COLS, NUM_COLS, CAT_COLS, CAT_ORDINAL_COLS,
    BMI_BINS, BMI_LABELS, AGE_BINS, AGE_LABELS, HOMA_IR_DIVISOR, GLUCOSE_RISK_THRESHOLD
)

# Global variables to hold the loaded assets
FINAL_MODEL = None
STANDARD_SCALER = None
ORDINAL_ENCODER = None
ONE_HOT_ENCODER = None
KNN_IMPUTER = None
PCA_TRANSFORMER = None
FINAL_FEATURES_LIST = None


def _sanitize_and_coerce(df: pd.DataFrame) -> pd.DataFrame:
    """Prepare DataFrame for transformations."""
    df = df.copy()

    # Coerce numeric for imputation columns (including raw inputs that might be numeric)
    # NOTE: We include all raw numerical inputs here to ensure they are float/int
    raw_num_cols = [c for c in NUM_COLS if c not in ['caffeine_missing_flag', 'HOMA_IR']]

    # We must ensure all columns that should be numerical (raw or imputed) are converted
    for col in set(raw_num_cols):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        else:
            # Handle case where a required input column is entirely missing
            df[col] = np.nan

    # Sanitize categoricals for one-hot (including the newly moved 'stress_level')
    if ONE_HOT_ENCODER is not None and hasattr(ONE_HOT_ENCODER, "categories_"):
        for i, col in enumerate(CAT_COLS):
            if col not in df.columns:
                continue
            allowed = set(ONE_HOT_ENCODER.categories_[i].tolist())
            fallback = None
            for cand in ["Unknown", "Other", "Undefined", "missing"]:
                if cand in allowed:
                    fallback = cand
                    break
            if fallback is None and len(allowed) > 0:
                fallback = next(iter(allowed))

            df[col] = df[col].where(df[col].isin(allowed), fallback)

    return df


def load_assets():
    """Loads all trained model and preprocessing assets."""
    global FINAL_MODEL, STANDARD_SCALER, ORDINAL_ENCODER, ONE_HOT_ENCODER, KNN_IMPUTER, PCA_TRANSFORMER, FINAL_FEATURES_LIST

    print("Attempting to load model and preprocessors...")
    try:
        FINAL_MODEL = joblib.load(FINAL_MODEL_PATH)
        STANDARD_SCALER = joblib.load(STANDARD_SCALER_PATH)
        ORDINAL_ENCODER = joblib.load(ORDINAL_ENCODER_PATH)
        ONE_HOT_ENCODER = joblib.load(ONE_HOT_ENCODER_PATH)
        KNN_IMPUTER = joblib.load(KNN_IMPUTER_PATH)
        PCA_TRANSFORMER = joblib.load(PCA_TRANSFORMER_PATH)

        with open(FINAL_FEATURES_LIST_PATH, "r") as f:
            FINAL_FEATURES_LIST = json.load(f)

        print("All assets loaded successfully!")
    except FileNotFoundError as e:
        print(f"Error: Required asset not found: {e.filename}")
        raise
    except Exception as e:
        print(f"An unexpected error occurred during asset loading: {e}")
        raise


def preprocess_input(input_df: pd.DataFrame) -> np.ndarray:
    """
    Applies full preprocessing (Imputation, Feature Engineering,
    Scaling/Encoding, PCA) to raw input DataFrame.
    """
    if FINAL_MODEL is None or FINAL_FEATURES_LIST is None:
        raise RuntimeError("Model assets not loaded. Call load_assets() first.")

    # --- A. Sanitize ---
    try:
        df_processed = _sanitize_and_coerce(input_df)
    except Exception as e:
        raise RuntimeError(f"Input validation/coercion failed: {e}")

    # --- B. Imputation & Flags ---
    df_processed["exercise_type"] = df_processed.get("exercise_type").fillna("Undefined")

    # Convert stress_level to numerical values to match training
    stress_level_mapping = {
        'Low': 1,
        'Medium': 2, 
        'High': 3
    }
    if 'stress_level' in df_processed.columns:
        df_processed['stress_level'] = df_processed['stress_level'].map(stress_level_mapping).fillna(2)  # Default to Medium

    # Map user input features to training features
    # Create missing categorical features with default values
    if 'sleep_quality' not in df_processed.columns:
        df_processed['sleep_quality'] = 'Good'  # Default value
    
    if 'smoking_level' not in df_processed.columns:
        # Map smoking_status to smoking_level
        smoking_mapping = {
            'Never': 'Non-smoker',
            'Former Smoker': 'Non-smoker', 
            'Current Smoker': 'Light',
            'Heavy Smoker': 'Heavy'
        }
        if 'smoking_status' in df_processed.columns:
            df_processed['smoking_level'] = df_processed['smoking_status'].map(smoking_mapping).fillna('Non-smoker')
        else:
            df_processed['smoking_level'] = 'Non-smoker'
    
    if 'occupation' not in df_processed.columns:
        df_processed['occupation'] = 'Engineer'  # Default value
    
    if 'diet_type' not in df_processed.columns:
        # Map dietary_habits to diet_type
        diet_mapping = {
            'Balanced': 'Omnivore',
            'Vegetarian': 'Vegetarian',
            'Vegan': 'Vegan',
            'Keto': 'Keto',
            'High Protein': 'Omnivore',
            'Low Carb': 'Keto'
        }
        if 'dietary_habits' in df_processed.columns:
            df_processed['diet_type'] = df_processed['dietary_habits'].map(diet_mapping).fillna('Omnivore')
        else:
            df_processed['diet_type'] = 'Omnivore'
    
    if 'device_usage' not in df_processed.columns:
        df_processed['device_usage'] = 'Moderate'  # Default value
    
    if 'healthcare_access' not in df_processed.columns:
        df_processed['healthcare_access'] = 'Moderate'  # Default value
    
    if 'insurance' not in df_processed.columns:
        df_processed['insurance'] = 'Yes'  # Default value
    
    if 'sunlight_exposure' not in df_processed.columns:
        df_processed['sunlight_exposure'] = 'Moderate'  # Default value
    
    if 'family_history' not in df_processed.columns:
        df_processed['family_history'] = 'No'  # Default value
    
    if 'pet_owner' not in df_processed.columns:
        df_processed['pet_owner'] = 'No'  # Default value

    try:
        knn_data = df_processed[KNN_IMPUTE_COLS]
        df_processed[KNN_IMPUTE_COLS] = KNN_IMPUTER.transform(knn_data)
    except Exception as e:
        raise RuntimeError(f"KNN imputation failed: {e}")

    df_processed["caffeine_missing_flag"] = df_processed["caffeine_intake"].isnull().astype(int)
    df_processed["caffeine_intake"] = df_processed["caffeine_intake"].fillna("Unknown")

    # --- C. Feature Engineering ---
    try:
        df_processed["bmi_cat"] = pd.cut(df_processed["bmi"], bins=BMI_BINS, labels=BMI_LABELS, right=False,
                                         include_lowest=True)
        df_processed["age_group"] = pd.cut(df_processed["age"], bins=AGE_BINS, labels=AGE_LABELS, right=False,
                                           include_lowest=True)
        df_processed["HOMA_IR"] = (df_processed["glucose"] * df_processed["insulin"]) / HOMA_IR_DIVISOR
        df_processed["diabetes_risk_flag"] = np.where(df_processed["glucose"] > GLUCOSE_RISK_THRESHOLD, "High Risk",
                                                      "Normal/Pre-Risk")
    except Exception as e:
        raise RuntimeError(f"Feature engineering failed: {e}")

    # --- D. Scaling ---
    # NUM_COLS now only contains the numerical features.
    try:
        df_processed.loc[:, NUM_COLS] = STANDARD_SCALER.transform(df_processed[NUM_COLS])
    except Exception as e:
        raise RuntimeError(f"Standard scaling failed: {e}")

    # --- E. Encoding ---
    try:
        # Ordinal encoding uses newly engineered categorical features
        df_processed.loc[:, CAT_ORDINAL_COLS] = ORDINAL_ENCODER.transform(df_processed[CAT_ORDINAL_COLS])
    except Exception as e:
        raise RuntimeError(f"Ordinal encoding failed: {e}")

    try:
        # One-Hot encoding uses original categorical features + the new 'diabetes_risk_flag'
        onehot_encoded = ONE_HOT_ENCODER.transform(df_processed[CAT_COLS])
        onehot_encoded_df = pd.DataFrame(
            onehot_encoded,
            columns=ONE_HOT_ENCODER.get_feature_names_out(CAT_COLS),
            index=df_processed.index,
        )
    except Exception as e:
        raise RuntimeError(f"One-hot encoding failed: {e}")

    # Join numerical, ordinal-encoded, and one-hot encoded features
    df_final = df_processed.drop(columns=CAT_COLS).join(onehot_encoded_df)

    # --- F. Final Reindex + PCA ---
    try:
        # Ensure all columns are present and in the correct order for PCA
        X_for_pca = df_final.reindex(columns=FINAL_FEATURES_LIST, fill_value=0).values
    except Exception as e:
        raise RuntimeError(f"Final feature reindexing failed: {e}")

    try:
        X_pca = PCA_TRANSFORMER.transform(X_for_pca)
    except Exception as e:
        raise RuntimeError(f"PCA transformation failed: {e}")

    return X_pca


def make_prediction(X_pca: np.ndarray) -> dict:
    """Performs the final prediction using the loaded model."""
    if FINAL_MODEL is None:
        raise RuntimeError("Model assets not loaded. Call load_assets() first.")

    probability_of_disease = FINAL_MODEL.predict_proba(X_pca)[:, 1][0]
    predicted_class = FINAL_MODEL.predict(X_pca)[0]
    prediction_label = "Disease" if predicted_class == 1 else "No Disease"

    return {
        "prediction_label": prediction_label,
        "probability_of_disease": round(probability_of_disease, 4),
    }