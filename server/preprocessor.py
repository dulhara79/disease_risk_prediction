import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from config import (
    FINAL_MODEL_PATH, STANDARD_SCALER_PATH, ORDINAL_ENCODER_PATH, ONE_HOT_ENCODER_PATH,
    KNN_IMPUTER_PATH, PCA_TRANSFORMER_PATH,
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


def _sanitize_and_coerce(df: pd.DataFrame) -> pd.DataFrame:
    """Prepare DataFrame for transformations:

    - Ensure expected columns exist
    - Coerce numeric columns to float and replace non-numeric with NaN
    - Replace unseen categorical values with a safe fallback that exists in the
      fitted OneHotEncoder categories (or the first known category)
    """
    df = df.copy()

    # Ensure numeric columns exist and are numeric
    missing_num = [c for c in KNN_IMPUTE_COLS + NUM_COLS if c not in df.columns]
    if missing_num:
        raise RuntimeError(f"Missing numeric/required columns before preprocessing: {missing_num}")

    for col in set(KNN_IMPUTE_COLS + NUM_COLS):
        # Coerce to numeric; invalid parsing becomes NaN which KNNImputer can handle
        try:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        except Exception:
            df[col] = df[col].astype(float)

    # Ensure categorical columns exist
    missing_cat = [c for c in CAT_COLS + CAT_ORDINAL_COLS if c not in df.columns]
    if missing_cat:
        # ordinal columns like 'bmi_cat' and 'age_group' may be created later; only error for input cat cols
        missing_input_cat = [c for c in CAT_COLS if c not in df.columns]
        if missing_input_cat:
            raise RuntimeError(f"Missing categorical input columns: {missing_input_cat}")

    # Sanitize categorical values against fitted OneHotEncoder categories if available
    if ONE_HOT_ENCODER is not None and hasattr(ONE_HOT_ENCODER, 'categories_'):
        for i, col in enumerate(CAT_COLS):
            if col not in df.columns:
                continue
            allowed = set(ONE_HOT_ENCODER.categories_[i].tolist())
            # If the encoder had an 'Unknown' or similar category, prefer that as fallback
            fallback = None
            for cand in ['Unknown', 'Other', 'Undefined', 'missing']:
                if cand in allowed:
                    fallback = cand
                    break
            if fallback is None:
                # pick the first known category as last-resort fallback
                fallback = next(iter(allowed)) if len(allowed) > 0 else None

            # Replace unseen categories with fallback
            df[col] = df[col].where(df[col].isin(allowed), fallback)

    return df


def load_assets():
    """
    Loads all trained model and preprocessing assets from disk into global variables.
    """
    global FINAL_MODEL, STANDARD_SCALER, ORDINAL_ENCODER, ONE_HOT_ENCODER, KNN_IMPUTER, PCA_TRANSFORMER

    print("Attempting to load model and preprocessors...")

    try:
        FINAL_MODEL = joblib.load(FINAL_MODEL_PATH)
        STANDARD_SCALER = joblib.load(STANDARD_SCALER_PATH)
        ORDINAL_ENCODER = joblib.load(ORDINAL_ENCODER_PATH)
        ONE_HOT_ENCODER = joblib.load(ONE_HOT_ENCODER_PATH)
        KNN_IMPUTER = joblib.load(KNN_IMPUTER_PATH)
        PCA_TRANSFORMER = joblib.load(PCA_TRANSFORMER_PATH)
        print("All assets loaded successfully!")
    except FileNotFoundError as e:
        print(f"Error: Required asset not found: {e.filename}. Ensure you run 'train_and_save_preprocessors.py' first.")
        raise
    except Exception as e:
        print(f"An unexpected error occurred during asset loading: {e}")
        raise


def preprocess_input(input_df: pd.DataFrame) -> np.ndarray:
    """
    Applies the full preprocessing pipeline (Imputation, Feature Engineering,
    Scaling/Encoding, PCA) to a raw input DataFrame.

    Args:
        input_df: DataFrame containing raw user data (1 row, 20 columns).

    Returns:
        NumPy array (1 row) ready for model prediction after PCA.
    """
    if FINAL_MODEL is None:
        raise RuntimeError("Model assets not loaded. Call load_assets() first.")

    # Sanitize and coerce types before running transformers
    try:
        df_processed = _sanitize_and_coerce(input_df)
    except Exception as e:
        raise RuntimeError(f"Input validation/coercion failed: {e}")

    # --- A. Imputation and Flag Engineering ---

    # 1. Exercise Type Imputation (Categorical)
    df_processed['exercise_type'] = df_processed.get('exercise_type').fillna(value='Undefined')

    # 2. KNN Imputation (Numerical)
    # Use the fitted KNN imputer for the designated columns
    try:
        df_processed[KNN_IMPUTE_COLS] = KNN_IMPUTER.transform(df_processed[KNN_IMPUTE_COLS])
    except Exception as e:
        raise RuntimeError(f"KNN imputation failed: {e}")

    # 3. Caffeine Imputation and Flag Engineering (Categorical/Flag)
    # Note: If the user explicitly sends 'None' or 'NaN' in the JSON, this works.
    df_processed['caffeine_missing_flag'] = df_processed['caffeine_intake'].isnull().astype(int)
    df_processed['caffeine_intake'] = df_processed['caffeine_intake'].fillna('Unknown')

    # --- B. Feature Engineering ---

    # 1. BMI Category
    try:
        df_processed['bmi_cat'] = pd.cut(df_processed['bmi'], bins=BMI_BINS, labels=BMI_LABELS, right=False,
                                         include_lowest=True)
    except Exception as e:
        raise RuntimeError(f"Failed to create 'bmi_cat': {e}")

    # 2. Age Group
    try:
        df_processed['age_group'] = pd.cut(df_processed['age'], bins=AGE_BINS, labels=AGE_LABELS, right=False,
                                           include_lowest=True)
    except Exception as e:
        raise RuntimeError(f"Failed to create 'age_group': {e}")

    # 3. HOMA-IR and Diabetes Risk Flag
    try:
        df_processed['HOMA_IR'] = (df_processed['glucose'] * df_processed['insulin']) / HOMA_IR_DIVISOR
        df_processed['diabetes_risk_flag'] = np.where(df_processed['glucose'] > GLUCOSE_RISK_THRESHOLD, 'High Risk',
                                                      'Normal/Pre-Risk')
    except Exception as e:
        raise RuntimeError(f"Failed to compute HOMA_IR or diabetes risk flag: {e}")

    # --- C. Scaling/Encoding ---

    # Apply Standard Scaling
    try:
        df_processed[NUM_COLS] = STANDARD_SCALER.transform(df_processed[NUM_COLS])
    except Exception as e:
        raise RuntimeError(f"Standard scaling failed: {e}")

    # Apply Ordinal Encoding
    try:
        df_processed[CAT_ORDINAL_COLS] = ORDINAL_ENCODER.transform(df_processed[CAT_ORDINAL_COLS])
    except Exception as e:
        raise RuntimeError(f"Ordinal encoding failed: {e}")

    # Apply One-Hot Encoding
    try:
        onehot_encoded = ONE_HOT_ENCODER.transform(df_processed[CAT_COLS])
        onehot_encoded_df = pd.DataFrame(onehot_encoded,
                                         columns=ONE_HOT_ENCODER.get_feature_names_out(CAT_COLS),
                                         index=df_processed.index)
    except Exception as e:
        raise RuntimeError(f"One-hot encoding failed: {e}")

    # Drop original categorical columns and concat new one-hot features
    df_final = df_processed.drop(columns=CAT_COLS).join(onehot_encoded_df)

    # --- D. Final Feature Selection and PCA ---

    # Recreate the final column list for PCA transformation in the correct order
    X_cols = NUM_COLS + CAT_ORDINAL_COLS + list(onehot_encoded_df.columns)

    # ⚠️ CRUCIAL: To ensure consistency, the columns MUST be exactly the same and
    # in the same order as the training data used to fit the PCA object.
    # For a production application, you would save the final feature names list
    # from X_train_pca and use it here to guarantee order.
    # Assuming X_cols is correctly ordered based on the training process:
    X_for_pca = df_final[X_cols].values  # Get NumPy array

    # PCA Transformation
    try:
        X_pca = PCA_TRANSFORMER.transform(X_for_pca)
    except Exception as e:
        raise RuntimeError(f"PCA transformation failed: {e}")

    return X_pca


def make_prediction(X_pca: np.ndarray) -> dict:
    """
    Performs the final prediction using the loaded model.
    """
    if FINAL_MODEL is None:
        raise RuntimeError("Model assets not loaded. Call load_assets() first.")

    # Get probability of class 1 (Disease)
    probability_of_disease = FINAL_MODEL.predict_proba(X_pca)[:, 1][0]

    # Get the hard prediction
    predicted_class = FINAL_MODEL.predict(X_pca)[0]

    # Interpret the result
    prediction_label = "Disease" if predicted_class == 1 else "No Disease"

    return {
        "prediction_label": prediction_label,
        "probability_of_disease": round(probability_of_disease, 4)
    }
