import React, { useState, useEffect, useMemo } from 'react';
import { Loader, BarChart, Heart, Activity, DollarSign, Users, XCircle, CheckCircle, TrendingUp, AlertTriangle, Sparkles, Shield } from 'lucide-react';

const API_ENDPOINT = 'http://127.0.0.1:8000/predict';

const FIELD_DEFINITIONS = {
  'Personal Information': [
    { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    { id: 'age', label: 'Age (Years)', type: 'number', min: 18, max: 100, placeholder: 'e.g., 45' },
    { id: 'income', label: 'Annual Income ($)', type: 'number', min: 0, max: 500000, placeholder: 'e.g., 65000' },
    { id: 'marital_status', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
    { id: 'work_hours', label: 'Work Hours (per week)', type: 'number', min: 0, max: 80, placeholder: 'e.g., 45' },
  ],
  'Health Vitals': [
    { id: 'blood_pressure', label: 'Blood Pressure (Systolic)', type: 'number', min: 90, max: 200, placeholder: 'e.g., 135' },
    { id: 'heart_rate', label: 'Heart Rate (BPM)', type: 'number', min: 40, max: 150, placeholder: 'e.g., 82' },
    { id: 'glucose', label: 'Glucose (mg/dL)', type: 'number', min: 60, max: 400, placeholder: 'e.g., 110' },
    { id: 'insulin', label: 'Insulin (μU/mL)', type: 'number', min: 1, max: 50, step: 0.1, placeholder: 'e.g., 12.5' },
    { id: 'cholesterol', label: 'Total Cholesterol (mg/dL)', type: 'number', min: 100, max: 400, step: 0.1, placeholder: 'e.g., 210.5' },
    { id: 'mental_health_score', label: 'Mental Health Score (1-100)', type: 'number', min: 1, max: 100, placeholder: 'e.g., 78' },
  ],
  'Physical Measurements': [
    { id: 'bmi', label: 'BMI', type: 'number', min: 15, max: 50, step: 0.1, placeholder: 'e.g., 28.5' },
    { id: 'waist_size', label: 'Waist Size (cm)', type: 'number', min: 50, max: 150, step: 0.1, placeholder: 'e.g., 95.0' },
    { id: 'physical_activity', label: 'Physical Activity (Hours/Week)', type: 'number', min: 0, max: 40, step: 0.5, placeholder: 'e.g., 5' },
  ],
  'Lifestyle & Diet': [
    { id: 'calorie_intake', label: 'Daily Calorie Intake', type: 'number', min: 1000, max: 5000, placeholder: 'e.g., 2200' },
    { id: 'sugar_intake', label: 'Sugar Intake (Grams/Day)', type: 'number', min: 0, max: 200, step: 0.1, placeholder: 'e.g., 55.0' },
    { id: 'water_intake', label: 'Water Intake (Liters/Day)', type: 'number', min: 0, max: 10, step: 0.1, placeholder: 'e.g., 2.5' },
    { id: 'dietary_habits', label: 'Dietary Habits', type: 'select', options: ['Balanced', 'High-Carb', 'Low-Carb', 'Vegetarian', 'Vegan', 'Keto'] },
    { id: 'exercise_type', label: 'Primary Exercise Type', type: 'select', options: ['Cardio', 'Strength', 'Mixed', 'Yoga', 'Swimming', 'Cycling', 'Undefined'] },
  ],
  'Habits & Stress': [
    { id: 'smoking_status', label: 'Smoking Status', type: 'select', options: ['Never', 'Former Smoker', 'Current Smoker', 'Heavy Smoker'] },
    { id: 'alcohol_consumption', label: 'Alcohol Consumption', type: 'select', options: ['Not Drinking', 'Occasionally', 'Moderate', 'Regularly', 'Frequently'] },
    { id: 'caffeine_intake', label: 'Caffeine Intake', type: 'select', options: ['None', '1 cup daily', '2 cups daily', '3+ cups daily', 'High', 'Moderate', 'Unknown'] },
    { id: 'stress_level', label: 'Stress Level', type: 'select', options: ['Low', 'Medium', 'High'] },
  ],
};

const round = (value, decimals) => {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

const initialFormData = Object.values(FIELD_DEFINITIONS).flat().reduce((acc, field) => {
  acc[field.id] = field.type === 'number' ? '' : field.options?.[0] || '';
  return acc;
}, {});

const SectionIcon = ({ category }) => {
  const icons = {
    'Personal Information': Users,
    'Health Vitals': Heart,
    'Physical Measurements': TrendingUp,
    'Lifestyle & Diet': Activity,
    'Habits & Stress': AlertTriangle,
  };
  const Icon = icons[category] || BarChart;
  return <Icon className="w-6 h-6 text-white" />;
};

const CustomInput = ({ field, value, onChange }) => (
  <div className="flex flex-col space-y-2 group">
    <label htmlFor={field.id} className="text-sm font-semibold text-gray-700 flex justify-between items-center">
      <span className="flex items-center gap-2">
        {field.label}
      </span>
      {field.type === 'number' && field.id !== 'income' && <span className="text-xs font-normal text-gray-400">({field.min}-{field.max})</span>}
    </label>
    {field.type === 'select' ? (
      <div className="relative">
        <select
          id={field.id}
          name={field.id}
          value={value}
          onChange={onChange}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white appearance-none cursor-pointer hover:border-purple-300"
        >
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-purple-300"
      />
    )}
  </div>
);

const RiskGauge = ({ probability }) => {
  const risk = probability * 100;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (risk / 100) * circumference;

  let gradient = 'from-green-400 to-emerald-500';
  let shadowColor = 'shadow-green-500/50';
  let label = 'Low Risk';
  let icon = <Shield className="w-6 h-6 text-green-500" />;
  
  if (risk > 33) {
    gradient = 'from-yellow-400 to-orange-500';
    shadowColor = 'shadow-yellow-500/50';
    label = 'Moderate Risk';
    icon = <AlertTriangle className="w-6 h-6 text-yellow-500" />;
  }
  if (risk > 66) {
    gradient = 'from-red-400 to-rose-600';
    shadowColor = 'shadow-red-500/50';
    label = 'High Risk';
    icon = <AlertTriangle className="w-6 h-6 text-red-500" />;
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${gradient} p-1 shadow-2xl ${shadowColor} animate-pulse-slow`}>
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={risk > 66 ? "#f87171" : risk > 33 ? "#fbbf24" : "#34d399"} />
                <stop offset="100%" stopColor={risk > 66 ? "#dc2626" : risk > 33 ? "#f97316" : "#10b981"} />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
              {Math.round(risk)}%
            </span>
            <span className="text-xs text-gray-400 font-medium mt-1">Risk Score</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {icon}
        <p className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{label}</p>
      </div>
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [loading]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    if (type === 'number') {
        const floatValue = parseFloat(value);
        if (!isNaN(floatValue)) {
            processedValue = floatValue;
        } else if (value === '') {
            processedValue = '';
        } else {
            return;
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
        const probability = parseFloat(data.probability_of_disease);
        setPrediction({ ...data, probability_of_disease: round(probability, 4) });
      } else {
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
    const risk = prediction.probability_of_disease * 100;
    
    let gradient = 'from-green-400 to-emerald-600';
    let bgPattern = 'from-green-50 to-emerald-50';
    
    if (risk > 33) {
      gradient = 'from-yellow-400 to-orange-600';
      bgPattern = 'from-yellow-50 to-orange-50';
    }
    if (risk > 66) {
      gradient = 'from-red-400 to-rose-600';
      bgPattern = 'from-red-50 to-rose-50';
    }

    return (
      <div className="mt-12 relative animate-fadeInUp">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl blur-2xl opacity-20 animate-pulse-slow`}></div>
        <div className="relative p-8 bg-white rounded-3xl shadow-2xl border-2 border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className={`w-8 h-8 bg-gradient-to-br ${gradient} bg-clip-text text-transparent animate-pulse`} />
            <h2 className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              Your Health Analysis
            </h2>
            <Sparkles className={`w-8 h-8 bg-gradient-to-br ${gradient} bg-clip-text text-transparent animate-pulse`} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <RiskGauge probability={prediction.probability_of_disease} />
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${bgPattern} border-2 ${isHighRisk ? 'border-red-200' : 'border-green-200'} shadow-lg`}>
                <p className="text-sm font-semibold text-gray-600 mb-2">Predicted Outcome</p>
                <p className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                  {prediction.prediction_label}
                </p>
              </div>
              
              <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Disease Probability</span>
                  <span className={`text-2xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                    {(prediction.probability_of_disease * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out rounded-full shadow-lg`}
                    style={{ width: `${prediction.probability_of_disease * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-gray-600">Healthy Probability</span>
                  <span className="text-2xl font-black text-gray-700">
                    {((1 - prediction.probability_of_disease) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [prediction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <style>{`
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
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          
          <header className="py-12 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <Heart className="w-12 h-12 text-pink-500 animate-pulse" />
              <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Health Risk Predictor
              </h1>
              <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            </div>
            <p className="mt-4 text-xl text-gray-600 font-medium">
              Advanced AI-powered health analysis for personalized risk assessment
            </p>
            
          </header>

          <div className="relative bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-white/50 animate-fadeInUp">
            
            {error && (
              <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl flex items-center space-x-3 shadow-lg animate-fadeInUp">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-10">
              {Object.entries(FIELD_DEFINITIONS).map(([category, fields], idx) => {
                const gradients = [
                  'from-purple-500 to-pink-500',
                  'from-pink-500 to-rose-500',
                  'from-blue-500 to-cyan-500',
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-red-500',
                ];
                const gradient = gradients[idx % gradients.length];
                
                return (
                  <section key={category} className="group">
                    <div className={`flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg transform transition-all duration-300 hover:scale-[1.02]`}>
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <SectionIcon category={category} />
                      </div>
                      <h2 className="text-2xl font-black text-white">{category}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pl-4">
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
                );
              })}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="group px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold shadow-lg hover:shadow-xl hover:border-gray-400 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 bg-white transform hover:scale-105 active:scale-95"
              >
                <XCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Reset Form
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group relative px-8 py-4 rounded-2xl text-white font-bold shadow-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  {loading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      <span className="text-lg">Analyzing Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span className="text-lg">Get Prediction</span>
                      <TrendingUp className="w-6 h-6" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {renderResult}

          <footer className="mt-16 text-center">
            <div className="inline-block bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">Medical Disclaimer:</span> This is a predictive tool. Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}