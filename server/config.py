# Configuration for the Prediction API

from pathlib import Path

# --- Model & Preprocessor File Paths ---
MODELS_DIR = Path("server/models")
FINAL_MODEL_PATH = MODELS_DIR / 'diseased_prediction_model_lgbm_tuned.joblib'
STANDARD_SCALER_PATH = MODELS_DIR / 'standard_scaler.joblib'
ORDINAL_ENCODER_PATH = MODELS_DIR / 'ordinal_encoder.joblib'
ONE_HOT_ENCODER_PATH = MODELS_DIR / 'one_hot_encoder.joblib'
KNN_IMPUTER_PATH = MODELS_DIR / 'knn_imputer.joblib'
PCA_TRANSFORMER_PATH = MODELS_DIR / 'pca_90_variance.joblib'

# --- User Input & Feature Lists ---

# The 21 columns expected directly from the user in the POST request.
# This list is updated to match the features sent in the latest Postman payload
# and the fields required by the trained model pipeline.
USER_INPUT_COLUMNS = [
    'gender',
    'age',
    'blood_pressure',
    'heart_rate',
    'glucose',
    'insulin',
    'cholesterol',
    'bmi',

    # New/Corrected Features (required by model)
    'physical_activity',  # Corrected name (was physical_activity_level)
    'waist_size',
    'calorie_intake',
    'mental_health_score',
    'sugar_intake',

    # Categorical/Lifestyle features
    'smoking_status',
    'alcohol_consumption',
    'stress_level',
    'income',
    'marital_status',
    'exercise_type',
    'dietary_habits',
    'caffeine_intake'
]

# Columns used for KNN Imputation (must be handled if input contains NaN/None)
# Note: KNN Impute Columns in preprocessor.py still reference the old list,
# but for now, we focus on the USER_INPUT_COLUMNS for API validation.
KNN_IMPUTE_COLS = ['blood_pressure', 'heart_rate', 'insulin', 'income']

# Numerical Columns (used for Standard Scaling) including engineered features
# WARNING: This list needs to be updated too, but we prioritize the USER_INPUT_COLUMNS
# to get past the Flask validation first.
NUM_COLS = [
    'age', 'blood_pressure', 'heart_rate', 'glucose', 'insulin', 'cholesterol',
    'bmi', 'physical_activity', 'stress_level', 'income',
    'waist_size', 'calorie_intake', 'mental_health_score', 'sugar_intake',
    'caffeine_missing_flag',
    'HOMA_IR'
]

# Categorical Columns (used for One-Hot Encoding)
CAT_COLS = [
    'gender', 'smoking_status', 'alcohol_consumption', 'marital_status',
    'exercise_type', 'dietary_habits', 'caffeine_intake', 'diabetes_risk_flag'
]

# Ordinal Columns (used for Ordinal Encoding)
CAT_ORDINAL_COLS = ['bmi_cat', 'age_group']

# --- Feature Engineering Parameters ---

# 1. BMI Category Bins
BMI_BINS = [0, 18.5, 25.0, 30.0, float('inf')]
BMI_LABELS = ['Underweight', 'Normal', 'Overweight', 'Obese']

# 2. Age Group Bins
AGE_BINS = [18, 26, 41, 61, float('inf')]
AGE_LABELS = ['Young', 'Adult', 'Middle-aged', 'Senior']

# 3. HOMA-IR Constant
HOMA_IR_DIVISOR = 405.0

# 4. Diabetes Risk Threshold
GLUCOSE_RISK_THRESHOLD = 125
