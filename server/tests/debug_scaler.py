#!/usr/bin/env python3

import pandas as pd
import sys
import joblib

# Add current directory to path
sys.path.append('.')

from config import STANDARD_SCALER_PATH, NUM_COLS

def debug_scaler():
    print("Loading standard scaler...")
    scaler = joblib.load(STANDARD_SCALER_PATH)
    
    print(f"\nScaler feature names during fit:")
    if hasattr(scaler, 'feature_names_in_'):
        print(f"Number of features: {len(scaler.feature_names_in_)}")
        for i, name in enumerate(scaler.feature_names_in_):
            print(f"{i:2d}: {name}")
    else:
        print("Scaler doesn't have feature_names_in_ attribute")
    
    print(f"\nCurrent NUM_COLS in config:")
    print(f"Number of features: {len(NUM_COLS)}")
    for i, name in enumerate(NUM_COLS):
        print(f"{i:2d}: {name}")
    
    print(f"\nComparison:")
    if hasattr(scaler, 'feature_names_in_'):
        scaler_features = list(scaler.feature_names_in_)
        current_features = list(NUM_COLS)
        
        print(f"Scaler has {len(scaler_features)} features")
        print(f"Config has {len(current_features)} features")
        
        if set(scaler_features) == set(current_features):
            print("✅ Same features, checking order...")
            if scaler_features == current_features:
                print("✅ Order is also correct!")
            else:
                print("❌ Order is different!")
                print("\nMissing or different positions:")
                for i, (s_feat, c_feat) in enumerate(zip(scaler_features, current_features)):
                    if s_feat != c_feat:
                        print(f"Position {i}: scaler='{s_feat}' vs config='{c_feat}'")
        else:
            print("❌ Different features!")
            missing_in_config = set(scaler_features) - set(current_features)
            extra_in_config = set(current_features) - set(scaler_features)
            if missing_in_config:
                print(f"Missing in config: {missing_in_config}")
            if extra_in_config:
                print(f"Extra in config: {extra_in_config}")

if __name__ == "__main__":
    debug_scaler()