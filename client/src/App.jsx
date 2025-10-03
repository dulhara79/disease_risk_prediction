import React, { useState, useEffect, useMemo } from 'react';
import { Loader, BarChart, Heart, Activity, DollarSign, Users, XCircle, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

// --- Configuration and Constants ---

// The backend URL is hardcoded here for testing. Update this when deploying your Flask server.
const API_ENDPOINT = 'http://localhost:5000/predict'; 

// Define the fields required by the backend, categorized for better UI flow.
// NOTE: These fields have been updated to match the model's requirements (e.g., 
// including calorie_intake and waist_size, and changing 'physical_activity_level' to 'physical_activity')
const FIELD_DEFINITIONS = {
  'Vitals & Metrics': [
    { id: 'age', label: 'Age (Years)', type: 'number', min: 18, max: 100, placeholder: 'e.g., 45' },
    { id: 'bmi', label: 'BMI', type: 'number', min: 15, max: 50, step: 0.1, placeholder: 'e.g., 25.5' },
    { id: 'blood_pressure', label: 'Blood Pressure (Systolic)', type: 'number', min: 90, max: 180, placeholder: 'e.g., 120' },
    { id: 'heart_rate', label: 'Heart Rate (BPM)', type: 'number', min: 40, max: 150, placeholder: 'e.g., 72' },
    { id: 'glucose', label: 'Glucose (mg/dL)', type: 'number', min: 60, max: 400, placeholder: 'e.g., 95' },
    { id: 'insulin', label: 'Insulin ($\mu$U/mL)', type: 'number', min: 1, max: 50, step: 0.1, placeholder: 'e.g., 8.0' },
    { id: 'cholesterol', label: 'Total Cholesterol (mg/dL)', type: 'number', min: 100, max: 300, placeholder: 'e.g., 200' },
    { id: 'waist_size', label: 'Waist Size (Inches)', type: 'number', min: 20, max: 60, placeholder: 'e.g., 34' }, // <-- ADDED
    // 'triglycerides', 'hdl', 'ldl' were removed as they were "unseen" by the model
  ],
  'Lifestyle & Habits': [
    { id: 'physical_activity', label: 'Physical Activity (Hours/Week)', type: 'number', min: 0, max: 40, step: 0.5, placeholder: 'e.g., 5' }, // <-- UPDATED name
    { id: 'stress_level', label: 'Stress Level (1-10)', type: 'number', min: 1, max: 10, placeholder: 'e.g., 6' },
    { id: 'mental_health_score', label: 'Mental Health Score (1-10)', type: 'number', min: 1, max: 10, placeholder: 'e.g., 8' }, // <-- ADDED
    { id: 'calorie_intake', label: 'Calorie Intake (Daily)', type: 'number', min: 1000, max: 5000, placeholder: 'e.g., 2000' }, // <-- ADDED
    { id: 'sugar_intake', label: 'Sugar Intake (Grams/Day)', type: 'number', min: 0, max: 200, placeholder: 'e.g., 45' }, // <-- ADDED
    { id: 'smoking_status', label: 'Smoking Status', type: 'select', options: ['Non-smoker', 'Former Smoker', 'Current Smoker'] },
    { id: 'alcohol_consumption', label: 'Alcohol Consumption', type: 'select', options: ['None', 'Light', 'Moderate', 'Heavy'] },
    { id: 'exercise_type', label: 'Primary Exercise', type: 'select', options: ['Running', 'Weightlifting', 'Yoga', 'Swimming', 'Cycling', 'Undefined'] },
    { id: 'dietary_habits', label: 'Dietary Habits', type: 'select', options: ['Balanced', 'High-Carb', 'Low-Carb', 'Vegetarian', 'Vegan'] },
    { id: 'caffeine_intake', label: 'Caffeine Intake', type: 'select', options: ['None', 'Low', 'Medium', 'High', 'Unknown'] },
  ],
  'Socioeconomic': [
    { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { id: 'income', label: 'Annual Income ($)', type: 'number', min: 0, max: 500000, placeholder: 'e.g., 75000' },
    { id: 'marital_status', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
  ],
};

// Utility function for rounding
const round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

// Initial state derived from field definitions
const initialFormData = Object.values(FIELD_DEFINITIONS).flat().reduce((acc, field) => {
  acc[field.id] = field.type === 'number' ? '' : field.options?.[0] || '';
  return acc;
}, {});


// --- Utility Components ---

const SectionIcon = ({ category }) => {
  const icons = {
    'Vitals & Metrics': Heart,
    'Lifestyle & Habits': Activity,
    'Socioeconomic': DollarSign,
  };
  const Icon = icons[category] || BarChart;
  return <Icon className="w-6 h-6 text-indigo-400" />;
};

const CustomInput = ({ field, value, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={field.id} className="text-sm font-medium text-gray-700 flex justify-between items-center">
      {field.label}
      {field.type === 'number' && field.id !== 'income' && <span className="text-xs font-normal text-gray-500">({field.min}-{field.max})</span>}
    </label>
    {field.type === 'select' ? (
      <select
        id={field.id}
        name={field.id}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white appearance-none"
      >
        {field.options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        id={field.id}
        name={field.id}
        type="number"
        value={value}
        onChange={onChange}
        min={field.min}
        max={field.max}
        step={field.step || (field.id === 'bmi' || field.id === 'insulin' || field.id === 'physical_activity' ? 0.1 : 1)}
        placeholder={field.placeholder}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
      />
    )}
  </div>
);

const RiskGauge = ({ probability }) => {
  const risk = probability * 100;
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (risk / 100) * circumference;

  let color = 'text-green-500'; // Low Risk
  let label = 'Low Risk';
  if (risk > 33) {
    color = 'text-yellow-500'; // Moderate Risk
    label = 'Moderate Risk';
  }
  if (risk > 66) {
    color = 'text-red-500'; // High Risk
    label = 'High Risk';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          {/* Gauge Arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${color}`}
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{Math.round(risk)}%</span>
          <span className="text-xs text-gray-500">Risk</span>
        </div>
      </div>
      <p className={`mt-2 text-lg font-semibold ${color}`}>{label}</p>
    </div>
  );
};

// --- Main Application Component ---

export default function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Simple animation hook for the loader
  useEffect(() => {
    if (loading) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [loading]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers or keep as empty string if invalid
    let processedValue = value;
    if (type === 'number') {
        const floatValue = parseFloat(value);
        if (!isNaN(floatValue)) {
            processedValue = floatValue;
        } else if (value === '') {
            processedValue = '';
        } else {
            return; // Ignore non-numeric input for number fields
        }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const validateForm = () => {
    const errors = [];
    const allFields = Object.values(FIELD_DEFINITIONS).flat();

    allFields.forEach(field => {
      const value = formData[field.id];
      if (value === '' || value === null || value === undefined) {
        errors.push(`${field.label} is required.`);
      }
      if (field.type === 'number' && typeof value === 'number') {
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.label} must be ${field.min} or greater.`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.label} must be ${field.max} or less.`);
        }
      }
    });

    if (errors.length > 0) {
        setError(errors.join(' | '));
        return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setPrediction(null);
    setError(null);

    // Convert all numeric values to number type for the API call
    const payload = Object.keys(formData).reduce((acc, key) => {
        const value = formData[key];
        const fieldDef = Object.values(FIELD_DEFINITIONS).flat().find(f => f.id === key);
        
        acc[key] = fieldDef?.type === 'number' ? parseFloat(value) : value;
        return acc;
    }, {});


    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Ensure probability is a number and round it for display
        const probability = parseFloat(data.probability_of_disease);
        setPrediction({ ...data, probability_of_disease: round(probability, 4) });
      } else {
        // Handle backend validation/processing errors
        setError(data.error || "Prediction failed due to an unknown backend error.");
      }
    } catch (err) {
      setError("Failed to connect to the prediction service. Ensure the backend is running at " + API_ENDPOINT);
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setPrediction(null);
    setError(null);
  };

  const renderResult = useMemo(() => {
    if (!prediction) return null;

    const isHighRisk = prediction.probability_of_disease > 0.5;
    const resultColor = isHighRisk ? 'bg-red-500/10 border-red-500' : 'bg-green-500/10 border-green-500';
    const textColor = isHighRisk ? 'text-red-600' : 'text-green-600';
    const Icon = isHighRisk ? AlertTriangle : CheckCircle;

    return (
      <div className="mt-8 p-6 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 transform transition-all duration-500 animate-fadeInUp">
        <div className="flex items-center space-x-4 mb-4 pb-4 border-b">
          <Icon className={`w-8 h-8 ${textColor}`} />
          <h2 className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
            Prediction Result
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Gauge */}
          <div className="flex justify-center">
            <RiskGauge probability={prediction.probability_of_disease} />
          </div>

          {/* Details */}
          <div>
            {/* FIX: Removed duplicate 'className' attribute */}
            <div className={`p-4 rounded-lg shadow-inner ${resultColor} border-l-4`}>
              <p className="text-xl font-bold">Predicted Outcome:</p>
              <p className={`text-4xl mt-1 font-extrabold ${textColor}`}>{prediction.prediction_label}</p>
            </div>
            
            <div className="mt-4 text-gray-700 space-y-2">
                <div className="flex justify-between items-center text-lg font-medium">
                    <span>Probability of Disease:</span>
                    <span className="font-mono text-indigo-600">{prediction.probability_of_disease}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-medium">
                    <span>Probability of No Disease:</span>
                    <span className="font-mono text-indigo-600">{round(1 - prediction.probability_of_disease, 4)}</span>
                </div>
            </div>
          </div>
        </div>
        
      </div>
    );
  }, [prediction]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
      <style>{`
        /* Custom Keyframes for Modern Feel */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="py-8 text-center animate-fadeIn">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Health Risk Prediction Model
          </h1>
          <p className="mt-3 text-xl text-indigo-600">
            Input subject data to receive a precise disease risk prediction.
          </p>
        </header>

        {/* Main Card */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 animate-fadeInUp delay-100">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-3 transition duration-300">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Input Sections */}
          <div className="space-y-12">
            {Object.entries(FIELD_DEFINITIONS).map(([category, fields]) => (
              <section key={category} className="border-b border-gray-200 pb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <SectionIcon category={category} />
                  <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields.map(field => (
                    <CustomInput
                      key={field.id}
                      field={field}
                      value={formData[field.id] ?? ''}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center"
            >
              Reset Data
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-70 flex items-center justify-center space-x-2 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing Data...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Get Prediction</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Results Display */}
        {renderResult}

        {/* Footer Note */}
        <footer className="mt-12 text-center text-sm text-gray-500">
            Disclaimer: This is a predictive tool. Always consult a healthcare professional for a medical diagnosis.
        </footer>
      </div>
    </div>
  );
}
