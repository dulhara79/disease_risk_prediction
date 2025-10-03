#!/usr/bin/env python3

import pandas as pd
import sys
import json
from pathlib import Path

# Add current directory to path
sys.path.append('.')

from preprocessor import load_assets, preprocess_input
from config import USER_INPUT_COLUMNS

def test_preprocessing():
    # Test data from the user
    test_data = {
        "gender": "Male",
        "age": 45,
        "blood_pressure": 135,
        "heart_rate": 82,
        "glucose": 110,
        "insulin": 12.5,
        "cholesterol": 210.5,
        "bmi": 28.5,
        "physical_activity": 5,
        "waist_size": 95.0,
        "calorie_intake": 2200,
        "mental_health_score": 78,
        "sugar_intake": 55.0,
        "smoking_status": "Former Smoker",
        "alcohol_consumption": "Moderate",
        "stress_level": "Medium",
        "income": 65000.0,
        "marital_status": "Married",
        "exercise_type": "Cardio",
        "dietary_habits": "Balanced",
        "caffeine_intake": "2 cups daily",
        "water_intake": 2.5,
        "work_hours": 45
    }
    
    print("Loading assets...")
    try:
        load_assets()
        print("✅ Assets loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading assets: {e}")
        return
    
    print("\nCreating DataFrame from test data...")
    df = pd.DataFrame([test_data])
    print(f"Input DataFrame shape: {df.shape}")
    print(f"Input columns: {list(df.columns)}")
    
    print("\nTesting preprocessing...")
    try:
        result = preprocess_input(df)
        print(f"✅ Preprocessing successful!")
        print(f"Output shape: {result.shape}")
    except Exception as e:
        print(f"❌ Preprocessing failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_preprocessing()