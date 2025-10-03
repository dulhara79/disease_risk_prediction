#!/usr/bin/env python3

import sys
import joblib

# Add current directory to path
sys.path.append('.')

from config import ONE_HOT_ENCODER_PATH, CAT_COLS

def debug_onehot_encoder():
    print("Loading one-hot encoder...")
    encoder = joblib.load(ONE_HOT_ENCODER_PATH)
    
    print(f"\nOne-Hot Encoder feature names during fit:")
    if hasattr(encoder, 'feature_names_in_'):
        print(f"Number of features: {len(encoder.feature_names_in_)}")
        for i, name in enumerate(encoder.feature_names_in_):
            print(f"{i:2d}: {name}")
    else:
        print("Encoder doesn't have feature_names_in_ attribute")
    
    print(f"\nCurrent CAT_COLS in config:")
    print(f"Number of features: {len(CAT_COLS)}")
    for i, name in enumerate(CAT_COLS):
        print(f"{i:2d}: {name}")
    
    print(f"\nOne-Hot Encoder categories:")
    if hasattr(encoder, 'categories_'):
        for i, (feature_name, categories) in enumerate(zip(encoder.feature_names_in_, encoder.categories_)):
            print(f"{feature_name}: {list(categories)}")

if __name__ == "__main__":
    debug_onehot_encoder()