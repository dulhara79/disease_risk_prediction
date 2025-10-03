# config.py

from pathlib import Path

# --- Model & Preprocessor File Paths ---
MODELS_DIR = Path("models")
FINAL_MODEL_PATH = MODELS_DIR/'final_diseased_prediction_model_lgbm_tuned.joblib'
STANDARD_SCALER_PATH = MODELS_DIR/'standard_scaler.joblib'
ORDINAL_ENCODER_PATH = MODELS_DIR/'ordinal_encoder.joblib'
ONE_HOT_ENCODER_PATH = MODELS_DIR/'one_hot_encoder.joblib'
KNN_IMPUTER_PATH = MODELS_DIR/'knn_imputer.joblib'
PCA_TRANSFORMER_PATH = MODELS_DIR/'pca_90_variance.joblib'
FINAL_FEATURES_LIST_PATH = MODELS_DIR/'final_features_list.json'

# --- User Input & Feature Lists ---

# The 21 columns expected directly from the user in the POST request.
USER_INPUT_COLUMNS = [
    'gender', 'age', 'blood_pressure', 'heart_rate', 'glucose', 'insulin', 'cholesterol', 'bmi',
    'physical_activity', 'waist_size', 'calorie_intake', 'mental_health_score', 'sugar_intake',
    'smoking_status', 'alcohol_consumption', 'stress_level', 'income',
    'marital_status', 'exercise_type', 'dietary_habits', 'caffeine_intake',
    'water_intake',
    'work_hours'
]

# Columns used for KNN Imputation
KNN_IMPUTE_COLS = ['blood_pressure', 'heart_rate', 'insulin', 'income']

# Numerical Columns (used for Standard Scaling)
# The order MUST match the fitting order from the training script.
# Order based on StandardScaler feature_names_in_
NUM_COLS = [
    'age',
    'bmi', 
    'waist_size',
    'blood_pressure',
    'heart_rate',
    'cholesterol',
    'glucose',
    'insulin',
    'work_hours',
    'physical_activity',
    'calorie_intake',
    'sugar_intake',
    'water_intake',
    'stress_level',
    'mental_health_score',
    'income',
    'caffeine_missing_flag', # Engineered Flag
    'HOMA_IR'                # Engineered Score
]

# Categorical Columns (used for One-Hot Encoding)
# These must match the training data exactly
CAT_COLS = [
    'gender', 'sleep_quality', 'alcohol_consumption', 'smoking_level',
    'occupation', 'diet_type', 'exercise_type', 'device_usage',
    'healthcare_access', 'insurance', 'sunlight_exposure', 'caffeine_intake',
    'family_history', 'pet_owner', 'diabetes_risk_flag'
]

# Ordinal Columns (used for Ordinal Encoding)
CAT_ORDINAL_COLS = ['bmi_cat', 'age_group']

# --- Feature Engineering Parameters ---
BMI_BINS = [0, 18.5, 25.0, 30.0, float('inf')]
BMI_LABELS = ['Underweight', 'Normal', 'Overweight', 'Obese']
AGE_BINS = [18, 26, 41, 61, float('inf')]
AGE_LABELS = ['Young', 'Adult', 'Middle-aged', 'Senior']
HOMA_IR_DIVISOR = 405.0
GLUCOSE_RISK_THRESHOLD = 125