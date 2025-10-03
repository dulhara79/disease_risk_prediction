from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

from preprocessor import load_assets, preprocess_input, make_prediction
from config import USER_INPUT_COLUMNS

app = Flask(__name__)

# Load assets when the application starts
try:
    load_assets()
    print("Model and preprocessors loaded successfully.")
except Exception:
    print("Application will not start without required model assets.")
    # In a production environment, you might stop the application here or run it 
    # with a health check that fails. For this example, we proceed but allow 
    # preprocessor.py to handle the runtime error.

CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})

@app.route('/predict', methods=['POST'])
def predict():
    """
    Accepts user data via POST request, preprocesses it, and returns the prediction.
    """
    # 1. Input Validation
    if not request.json:
        return jsonify({"error": "No JSON data received"}), 400

    data = request.json

    # Check for missing required features
    if not all(col in data for col in USER_INPUT_COLUMNS):
        missing = [col for col in USER_INPUT_COLUMNS if col not in data]
        return jsonify({
            "error": "Missing required features in input data",
            "missing": missing
        }), 400

    try:
        # 2. Prepare Data
        # Create a single-row DataFrame from the input data in the correct order
        input_df = pd.DataFrame([data], columns=USER_INPUT_COLUMNS)

        # 3. Preprocessing and Prediction
        X_pca = preprocess_input(input_df)
        results = make_prediction(X_pca)

        # 4. Return Results
        return jsonify({
            "status": "success",
            "prediction_label": results['prediction_label'],
            "probability_of_disease": results['probability_of_disease']
        })

    except RuntimeError as e:
        # Handles errors from preprocessor (e.g., assets not loaded)
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        # Catch any unexpected errors during processing
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    # Ensure all model artifacts are saved in a 'models' directory relative to the app.py
    # Create the directory if it doesn't exist
    from config import MODELS_DIR

    MODELS_DIR.mkdir(exist_ok=True)

    print("Starting Flask server...")
    # You would typically use gunicorn or similar for production
    app.run(debug=True, host='0.0.0.0', port=8000)
