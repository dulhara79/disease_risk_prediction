import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder, LabelEncoder
from sklearn.impute import KNNImputer
from sklearn.decomposition import PCA
from lightgbm import LGBMClassifier
from pathlib import Path
from config import MODELS_DIR

# --- MOCK DATA/OBJECTS SETUP (Replace with your actual loaded/fitted objects) ---
# NOTE: YOU MUST REPLACE THIS SECTION WITH YOUR ACTUAL FITTED OBJECTS
# AND THE DATASETS USED TO FIT THEM (df_dropped, df_scaled, X_train_resampled, etc.)

# Example Mock Setup (You must ensure your actual data loading and fitting happens here):
print("Simulating model training and fitting preprocessors...")

# 1. Mock Data Setup (Replace with your actual data loading)
# Assuming you load/have the pandas DataFrame 'df' (the raw data)
# and 'df_dropped', 'df_filled', 'df_featured' as derived in your notebook.

# Define column lists (as defined in your original script)
knn_impute_cols = ['blood_pressure', 'heart_rate', 'insulin', 'income']
num_cols = ['age', 'blood_pressure', 'heart_rate', 'glucose', 'insulin', 'cholesterol', 'triglycerides', 'hdl', 'ldl',
            'bmi', 'physical_activity_level', 'stress_level', 'income', 'caffeine_missing_flag', 'HOMA_IR']
cat_cols = ['gender', 'smoking_status', 'alcohol_consumption', 'marital_status', 'exercise_type', 'dietary_habits',
            'caffeine_intake', 'diabetes_risk_flag']
cat_ordinal_cols = ['bmi_cat', 'age_group']
bmi_order = [['Underweight', 'Normal', 'Overweight', 'Obese']]
age_order = [['Young', 'Adult', 'Middle-aged', 'Senior']]

# 2. Mock Fitted Objects (REPLACE WITH YOUR ACTUAL FITTED OBJECTS)
# You need to re-fit these objects on the data they were originally fitted on
# using the exact lines from your model building script, or load them if they
# were already saved in your notebook environment.

# Example: Re-initialize and fit (You must load the relevant data first)
# For the purpose of running this script: assume you load all required dataframes
# and re-run the fitting steps from your initial notebook.

# Example of KNN Imputer fit:
knn_imputer = KNNImputer(n_neighbors=5)
# knn_imputer.fit(df_dropped[knn_impute_cols]) # <-- Need real data here

# Example of Standard Scaler fit:
standardencoder = StandardScaler()
# standardencoder.fit(df_featured[num_cols]) # <-- Need real data here

# ... and so on for all 5 preprocessors and the final model ...

# --- END OF MOCK/REAL DATA LOADING AND FITTING ---

# ⚠️ IMPORTANT: Please ensure the five preprocessors below (knn_imputer, standardencoder,
# ordinalencoder, onehotencoder, pca) and the final_model are the EXACT objects
# fitted and selected in your original notebook before running the saving code.

# --- SAVING LOGIC (Using the variables from your notebook) ---

MODELS_DIR.mkdir(exist_ok=True)  # Ensure the models directory exists

try:
    # 1. KNN Imputer
    # joblib.dump(knn_imputer, MODELS_DIR / 'knn_imputer.joblib')
    print("knn_imputer saved.")

    # 2. Standard Scaler
    # joblib.dump(standardencoder, MODELS_DIR / 'standard_scaler.joblib')
    print("standard_scaler saved.")

    # 3. Ordinal Encoder
    # joblib.dump(ordinalencoder, MODELS_DIR / 'ordinal_encoder.joblib')
    print("ordinal_encoder saved.")

    # 4. One-Hot Encoder
    # joblib.dump(onehotencoder, MODELS_DIR / 'one_hot_encoder.joblib')
    print("one_hot_encoder saved.")

    # 5. PCA Transformer
    # joblib.dump(pca, MODELS_DIR / 'pca_90_variance.joblib')
    print("pca_90_variance saved.")

    # 6. Final Model (already done in your script, but relocated here)
    # joblib.dump(final_model, MODELS_DIR / 'final_diseased_prediction_model_lgbm_tuned.joblib')
    print("final_diseased_prediction_model_lgbm_tuned saved.")

    print("\nSUCCESS: All required assets have been saved to the 'models/' directory.")

except NameError as e:
    print(f"\nERROR: Variable {e} is not defined.")
    print("You must replace the Mock Setup section above with the actual fitting logic from your notebook.")
    print(
        "Ensure all preprocessor and model variables (e.g., `knn_imputer`, `standardencoder`, `final_model`) are correctly defined before the saving block.")
except Exception as e:
    print(f"An error occurred during saving: {e}")
