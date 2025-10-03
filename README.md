# 🏥 Disease Risk Prediction System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-Latest-green.svg)](https://flask.palletsprojects.com/)
[![LightGBM](https://img.shields.io/badge/LightGBM-ML%20Model-orange.svg)](https://lightgbm.readthedocs.io/)

A comprehensive full-stack machine learning application that predicts disease risk based on health metrics, lifestyle factors, and personal data. Built with modern web technologies and advanced ML preprocessing pipelines.

## 📸 Screenshot

![Disease Risk Prediction Interface](https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Disease+Risk+Prediction+Interface)

## 🎯 Project Overview

This application analyzes 23 different health and lifestyle parameters to predict the probability of disease occurrence. The system uses a **LightGBM** model trained on processed health data with feature engineering and preprocessing.

## ✨ Key Features

- **🤖 Advanced ML Pipeline**: LightGBM model with 90% variance PCA reduction
- **📊 Real-time Predictions**: Instant disease risk assessment
- **🎨 Modern UI**: Beautiful React interface with Tailwind CSS
- **🔧 Smart Preprocessing**: Automatic feature engineering and data validation
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **⚡ Fast API**: Flask backend with optimized model loading
- **🛡️ Input Validation**: Comprehensive client and server-side validation
- **🎯 Risk Visualization**: Interactive gauges and risk indicators

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ML Pipeline  │
│   (React)       │◄──►│   (Flask)       │◄──►│   (LightGBM)    │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Endpoints │    │ • Feature Eng.  │
│ • Form Validation│    │ • CORS Handling │    │ • Preprocessing │
│ • Risk Display  │    │ • Data Validation│    │ • PCA Transform │
│ • Responsive UI │    │ • Model Loading │    │ • Prediction    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
disease_risk_prediction/
├── 📁 client/                     # Frontend React Application
│   ├── 📁 src/
│   │   ├── App.jsx               # Main React component
│   │   ├── main.jsx              # React entry point
│   │   ├── index.css             # Global styles
│   │   └── validate_fields.js    # Field validation utility
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── eslint.config.js          # ESLint configuration
│   └── index.html                # HTML template
│
├── 📁 server/                     # Backend Flask Application
│   ├── 📁 models/                # Trained ML models & preprocessors
│   │   ├── final_diseased_prediction_model_lgbm_tuned.joblib
│   │   ├── standard_scaler.joblib
│   │   ├── one_hot_encoder.joblib
│   │   ├── ordinal_encoder.joblib
│   │   ├── knn_imputer.joblib
│   │   ├── pca_90_variance.joblib
│   │   ├── label_encoder.joblib
│   │   └── final_features_list.json
│   │
│   ├── 📁 notebook/              # Jupyter notebooks
│   │   └── FDM_Mini_Project_correct.ipynb
│   │
│   ├── 📁 tests/                 # Test utilities & debugging
│   │   ├── test_api.py
│   │   ├── test_full_prediction.py
│   │   ├── debug_scaler.py
│   │   └── debug_onehot.py
│   │
│   ├── app.py                    # Flask application entry point
│   ├── config.py                 # Configuration & constants
│   ├── preprocessor.py           # ML preprocessing pipeline
│   ├── requirements.txt          # Python dependencies
│   └── train_and_save_preprocessors.py # Model training script
│
├── LICENSE                       # MIT License
├── README.md                     # This file
└── .gitignore                   # Git ignore rules
```

## 🔧 Technology Stack

### Frontend
- **React 19.1.1** - Modern UI framework
- **Vite 7.1.9** - Fast build tool and dev server
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **ESLint** - Code linting and quality

### Backend
- **Flask** - Lightweight Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Python 3.11+** - Programming language

### Machine Learning
- **LightGBM** - Gradient boosting framework
- **scikit-learn** - ML preprocessing and utilities
- **pandas** - Data manipulation and analysis
- **numpy** - Numerical computing
- **joblib** - Model serialization

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Python virtual environment** - Dependency isolation

## 📊 Input Parameters (23 Features)

The model accepts the following input parameters:

### 👤 Personal Information
- **Gender**: Male/Female
- **Age**: 18-100 years
- **Income**: Annual income ($)
- **Marital Status**: Single/Married/Divorced/Widowed
- **Work Hours**: Hours per week (0-80)

### 💓 Health Vitals
- **Blood Pressure**: Systolic pressure (90-200 mmHg)
- **Heart Rate**: Beats per minute (40-150 BPM)
- **Glucose**: Blood glucose level (60-400 mg/dL)
- **Insulin**: Insulin level (1-50 μU/mL)
- **Cholesterol**: Total cholesterol (100-400 mg/dL)
- **Mental Health Score**: Psychological wellbeing (1-100)

### 📏 Physical Measurements
- **BMI**: Body Mass Index (15-50)
- **Waist Size**: Waist circumference (50-150 cm)
- **Physical Activity**: Hours per week (0-40)

### 🍎 Lifestyle & Diet
- **Calorie Intake**: Daily calories (1000-5000)
- **Sugar Intake**: Grams per day (0-200g)
- **Water Intake**: Liters per day (0-10L)
- **Dietary Habits**: Balanced/High-Carb/Low-Carb/Vegetarian/Vegan/Keto
- **Exercise Type**: Cardio/Strength/Mixed/Yoga/Swimming/Cycling/Undefined

### 🚭 Habits & Stress
- **Smoking Status**: Never/Former Smoker/Current Smoker/Heavy Smoker
- **Alcohol Consumption**: Not Drinking/Occasionally/Moderate/Regularly/Frequently
- **Caffeine Intake**: Various levels from None to High
- **Stress Level**: Low/Medium/High

## 🔍 Machine Learning Pipeline

### 1. **Data Preprocessing**
```python
# KNN Imputation for missing values
knn_imputer = KNNImputer(n_neighbors=5)

# Feature Engineering
- BMI categorization (Underweight/Normal/Overweight/Obese)
- Age grouping (Young/Adult/Middle-aged/Senior) 
- HOMA-IR calculation: (Glucose × Insulin) / 405
- Diabetes risk flagging based on glucose levels
```

### 2. **Feature Scaling & Encoding**
```python
# Standard Scaling for numerical features
StandardScaler()

# One-Hot Encoding for categorical features  
OneHotEncoder(drop='first', handle_unknown='ignore')

# Ordinal Encoding for ordered categories
OrdinalEncoder()
```

### 3. **Dimensionality Reduction**
```python
# PCA with 90% variance retention
PCA(n_components=0.90)
```

### 4. **Model Prediction**
```python
# Tuned LightGBM Classifier
LGBMClassifier(
    n_estimators=400,
    learning_rate=0.1, 
    max_depth=12,
    num_leaves=70,
    min_child_samples=20
)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/dulhara79/disease_risk_prediction.git
cd disease_risk_prediction
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend will be available at: `http://127.0.0.1:8000`

### 3. Frontend Setup
```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 4. Access the Application
Open your browser and go to `http://localhost:5173` to use the application.

## 🔬 API Documentation

### POST `/predict`
Predicts disease risk based on input parameters.

**Request Body:**
```json
{
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
```

**Response:**
```json
{
    "prediction_label": "Disease",
    "probability_of_disease": 0.7839,
    "status": "success"
}
```

## 🧪 Testing

### Backend Testing
```bash
cd server

# Test preprocessing pipeline
python tests/test_preprocess.py

# Test full prediction pipeline  
python tests/test_full_prediction.py

# Test API endpoint
python tests/test_api.py
```

### Frontend Testing
```bash
cd client

# Run linting
npm run lint

# Validate field synchronization
node src/validate_fields.js
```

## 🔧 Configuration

### Backend Configuration (`server/config.py`)
- Model file paths
- Feature column definitions  
- Preprocessing parameters
- API settings

### Frontend Configuration (`client/src/App.jsx`)
- API endpoint URL
- Form field definitions
- Validation rules
- UI styling

## 📈 Model Performance

- **Algorithm**: LightGBM with hyperparameter tuning
- **Features**: 23 input features → 29 PCA components
- **Training**: RandomizedSearchCV with 3-fold cross-validation
- **Validation**: ROC-AUC scoring with SMOTE balancing

## 🛠️ Development

### Running in Development Mode

1. **Backend Development**:
   ```bash
   cd server
   python app.py  # Debug mode enabled
   ```

2. **Frontend Development**:
   ```bash
   cd client
   npm run dev  # Hot reload enabled
   ```

### Building for Production

1. **Frontend Build**:
   ```bash
   cd client
   npm run build
   ```

2. **Backend Production**:
   ```bash
   # Use a production WSGI server like Gunicorn
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Model Loading Errors**:
   ```bash
   # Ensure all model files exist in server/models/
   ls server/models/
   ```

2. **CORS Errors**:
   ```python
   # Check CORS configuration in app.py
   CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})
   ```

3. **Feature Mismatch**:
   ```bash
   # Validate field synchronization
   cd client/src && node validate_fields.js
   ```

4. **Port Conflicts**:
   - Frontend: Change port in `vite.config.js`
   - Backend: Change port in `app.py`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


<div align="center">

**⚕️ Important Disclaimer ⚕️**

*This application is for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.*

</div>

---

*Made with ❤️ for Data Mining!*
