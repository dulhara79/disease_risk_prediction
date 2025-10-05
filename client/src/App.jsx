import React, { useState, useEffect, useMemo } from "react";
import { Client } from "@gradio/client";
import {
  Loader,
  BarChart,
  Heart,
  Activity,
  Users,
  XCircle,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// --- Configuration and Constants ---

// 🌟 FIX 1: Corrected API endpoint for direct fetch to Gradio V4 API.
// The documentation uses the base URL "https://dulharakaushalya-disease-risk-backend.hf.space/"
// and the API name "/predict". The correct direct fetch endpoint is /run/{api_name}.
const API_ENDPOINT =
  "https://dulharakaushalya-disease-risk-backend.hf.space/run/predict";

// 🌟 FIX 2: Define the precise order of arguments as expected by the backend Python function.
// This is critical for the Gradio V4 API's array-based data payload in /run/.
const INPUT_ORDER = [
  "gender",
  "age",
  "blood_pressure",
  "heart_rate",
  "glucose",
  "insulin",
  "cholesterol",
  "bmi",
  "physical_activity",
  "waist_size",
  "calorie_intake",
  "mental_health_score",
  "sugar_intake",
  "smoking_status",
  "alcohol_consumption",
  "stress_level",
  "income",
  "marital_status",
  "exercise_type",
  "dietary_habits",
  "caffeine_intake",
  "water_intake",
  "work_hours",
];

// Define the fields required by the backend, categorized for better UI flow.
// Note: The marital status "Widowed" was removed to match the common Gradio dropdown options
// unless specifically confirmed in the backend's Python code.
const FIELD_DEFINITIONS = {
  "Personal Information": [
    {
      id: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female"],
      hint: "Biological gender for demographic analysis.",
    },
    {
      id: "age",
      label: "Age (Years)",
      type: "number",
      min: 18,
      max: 100,
      placeholder: "e.g., 45",
      hint: "Enter your age in full years (no decimals).",
    },
    {
      id: "income",
      label: "Annual Income ($)",
      type: "number",
      min: 0,
      max: 500000,
      placeholder: "e.g., 65000",
      hint: "Your approximate gross annual income (no decimals).",
    },
    {
      id: "marital_status",
      label: "Marital Status",
      type: "select",
      // Match common Gradio dropdown options: ["Single", "Married", "Divorced"]
      options: ["Single", "Married", "Divorced"],
      hint: "Select your current legal marital status.",
    },
    {
      id: "work_hours",
      label: "Work Hours (per week)",
      type: "number",
      min: 0,
      max: 80,
      placeholder: "e.g., 45",
      hint: "Average number of hours worked per week (no decimals).",
    },
  ],
  "Health Vitals": [
    {
      id: "blood_pressure",
      label: "Blood Pressure (Systolic)",
      type: "number",
      min: 90,
      max: 200,
      placeholder: "e.g., 135",
      hint: "The top number in a blood pressure reading (e.g., 135/85). No decimals.",
    },
    {
      id: "heart_rate",
      label: "Heart Rate (BPM)",
      type: "number",
      min: 40,
      max: 150,
      placeholder: "e.g., 82",
      hint: "Resting Heart Rate in Beats Per Minute (no decimals).",
    },
    {
      id: "glucose",
      label: "Glucose (mg/dL)",
      type: "number",
      min: 60,
      max: 400,
      placeholder: "e.g., 110",
      hint: "Blood glucose level (no decimals).",
    },
    {
      id: "insulin",
      label: "Insulin (μU/mL)",
      type: "number",
      min: 1,
      max: 50,
      step: 0.1,
      placeholder: "e.g., 12.5",
      hint: "Fasting Insulin level. Decimals are allowed (e.g., 12.5).",
    },
    {
      id: "cholesterol",
      label: "Total Cholesterol (mg/dL)",
      type: "number",
      min: 100,
      max: 400,
      step: 0.1,
      placeholder: "e.g., 210.5",
      hint: "Your most recent total cholesterol reading. Decimals are allowed.",
    },
    {
      id: "mental_health_score",
      label: "Mental Health Score (1-100)",
      type: "number",
      min: 1,
      max: 100,
      placeholder: "e.g., 78",
      hint: "<strong>Assess your overall mental well-being: 100 is excellent; 1 is severe distress. Please use full numbers (no decimals).</strong>",
    },
  ],
  "Physical Measurements": [
    {
      id: "bmi",
      label: "BMI",
      type: "number",
      min: 15,
      max: 50,
      step: 0.1,
      placeholder: "e.g., 28.5",
      hint: "Body Mass Index. Decimals are allowed (e.g., 28.5).",
    },
    {
      id: "waist_size",
      label: "Waist Size (cm)",
      type: "number",
      min: 50,
      max: 150,
      step: 0.1,
      placeholder: "e.g., 95.0",
      hint: "Circumference of your waist in centimeters. Decimals are allowed.",
    },
    {
      id: "physical_activity",
      label: "Physical Activity (Hours/Week)",
      type: "number",
      min: 0,
      max: 40,
      step: 0.5,
      placeholder: "e.g., 5",
      hint: "Total time spent exercising per week. Decimals are allowed (e.g., 5.5).",
    },
  ],
  "Lifestyle & Diet": [
    {
      id: "calorie_intake",
      label: "Daily Calorie Intake",
      type: "number",
      min: 1000,
      max: 5000,
      placeholder: "e.g., 2200",
      hint: "Average daily total calories consumed (no decimals).",
    },
    {
      id: "sugar_intake",
      label: "Sugar Intake (Grams/Day)",
      type: "number",
      min: 0,
      max: 200,
      step: 0.1,
      placeholder: "e.g., 55.0",
      hint: "Average daily grams of sugar. Decimals are allowed.",
    },
    {
      id: "water_intake",
      label: "Water Intake (Liters/Day)",
      type: "number",
      min: 0,
      max: 10,
      step: 0.1,
      placeholder: "e.g., 2.5",
      hint: "Average daily water intake in liters. Decimals are allowed.",
    },
    {
      id: "dietary_habits",
      label: "Dietary Habits",
      type: "select",
      options: [
        "Balanced",
        "Vegetarian",
        "Vegan",
        "Keto",
        "High Protein",
        "Low Carb",
      ],
      hint: "Select the dietary pattern that best describes you.",
    },
    {
      id: "exercise_type",
      label: "Primary Exercise Type",
      type: "select",
      options: ["Cardio", "Strength", "Mixed"],
      hint: "The main type of physical activity you engage in.",
    },
  ],
  "Habits & Stress": [
    {
      id: "smoking_status",
      label: "Smoking Status",
      type: "select",
      options: ["Never", "Former Smoker", "Current Smoker", "Heavy Smoker"],
      hint: "Your current status regarding tobacco use.",
    },
    {
      id: "alcohol_consumption",
      label: "Alcohol Consumption",
      type: "select",
      options: ["None", "Light", "Moderate", "Heavy"],
      hint: "Frequency and amount of alcohol consumption.",
    },
    {
      id: "caffeine_intake",
      label: "Caffeine Intake",
      type: "select",
      options: ["None", "Low", "Medium", "High"],
      hint: "Your average daily caffeine consumption.",
    },
    {
      id: "stress_level",
      label: "Stress Level",
      type: "select",
      options: ["Low", "Medium", "High"],
      hint: "Your perceived average stress level over the past month.",
    },
  ],
};

const STEP_TITLES = Object.keys(FIELD_DEFINITIONS);

// Utility function for rounding
const round = (value, decimals) => {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
};

// Initial state derived from field definitions
const initialFormData = Object.values(FIELD_DEFINITIONS)
  .flat()
  .reduce((acc, field) => {
    acc[field.id] = field.type === "number" ? "" : field.options?.[0] || "";
    return acc;
  }, {});

// --- Utility Components (Unchanged) ---

const SectionIcon = ({ category }) => {
  const icons = {
    "Personal Information": Users,
    "Health Vitals": Heart,
    "Physical Measurements": TrendingUp,
    "Lifestyle & Diet": Activity,
    "Habits & Stress": AlertTriangle,
  };
  const Icon = icons[category] || BarChart;
  return <Icon className="w-6 h-6 text-indigo-400" />;
};

const CustomInput = ({ field, value, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label
      htmlFor={field.id}
      className="text-sm font-medium text-gray-700 flex justify-between items-center"
    >
      {field.label}
      {field.type === "number" && (
        <span className="text-xs font-normal text-gray-500">
          ({field.min}-{field.max})
        </span>
      )}
    </label>
    {field.type === "select" ? (
      <select
        id={field.id}
        name={field.id}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white appearance-none"
      >
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
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
        step={field.step || 1}
        placeholder={field.placeholder}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
      />
    )}
    {/* Display the detailed hint/description */}
    {field.hint && (
      <p
        className="text-xs text-gray-500 mt-1"
        dangerouslySetInnerHTML={{ __html: field.hint }}
      />
    )}
  </div>
);

/**
 * Renders a circular gauge representing the risk.
 * NOTE: The input 'probabilityOfDisease' should be P(y=1)
 */
const RiskGauge = ({ probabilityOfDisease }) => {
  const risk = probabilityOfDisease * 100;
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (risk / 100) * circumference;

  let color = "text-green-500"; // Low Risk
  let label = "Low Risk";

  // Risk logic based on P(y=1)
  if (risk > 33) {
    color = "text-yellow-500"; // Moderate Risk
    label = "Moderate Risk";
  }
  if (risk > 66) {
    color = "text-red-500"; // High Risk
    label = "High Risk";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
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
          <span className={`text-xl font-bold ${color}`}>
            {Math.round(risk)}%
          </span>
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
  const [currentStep, setCurrentStep] = useState(0); // 0 to 4 (5 total steps)

  // Simple animation hook for the loader
  useEffect(() => {
    if (loading) {
      document.body.style.cursor = "wait";
    } else {
      document.body.style.cursor = "default";
    }
  }, [loading]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;
    if (type === "number") {
      const floatValue = parseFloat(value);
      if (!isNaN(floatValue)) {
        processedValue = floatValue;
      } else if (value === "") {
        processedValue = "";
      } else {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const validateStep = (stepIndex) => {
    const errors = [];
    const category = STEP_TITLES[stepIndex];
    const fields = FIELD_DEFINITIONS[category];

    fields.forEach((field) => {
      const value = formData[field.id];
      // 1. Check for empty/null/undefined values
      if (value === "" || value === null || value === undefined) {
        errors.push(`${field.label} is required.`);
      }

      if (field.type === "number" && typeof value === "number") {
        // 2. Check numeric bounds
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.label} must be ${field.min} or greater.`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.label} must be ${field.max} or less.`);
        }

        // 3. Check for integers where decimals are not explicitly allowed (step undefined or 1)
        if ((field.step === undefined || field.step === 1) && value % 1 !== 0) {
          errors.push(
            `${field.label} should be a whole number (no decimals allowed).`
          );
        }
      }
    });

    if (errors.length > 0) {
      // Only show errors for the current step
      setError(errors.join(" | "));
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    if (currentStep < STEP_TITLES.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // 🌟 FIX 3: Updated handleSubmit to use Gradio V4 /run/predict structure and parse the response string 🌟
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate the final step before submission
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setPrediction(null);
    setError(null);

    // Build the data array in the exact order of the Python function arguments (from INPUT_ORDER)
    const dataArray = INPUT_ORDER.map((key) => {
      const value = formData[key];
      // Ensure numbers are converted to float before sending
      const fieldDef = Object.values(FIELD_DEFINITIONS)
        .flat()
        .find((f) => f.id === key);
      if (fieldDef?.type === "number" && value !== "") {
        // Gradio expects numbers as float or int, not strings
        return parseFloat(value);
      }
      return value;
    });

    // Gradio V4 API payload structure for /run/predict
    const payload = {
      data: dataArray,
    };

    // Log for debugging: console.log("Payload to Gradio:", payload);

    try {
      // The API endpoint is the /run/ endpoint
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Send the structured payload
      });

      const gradioResponse = await response.json();

      if (
        response.ok &&
        gradioResponse.data &&
        gradioResponse.data.length > 0
      ) {
        // The backend returns a single formatted string, e.g., "No Disease (prob: 0.8521)"
        const resultString = gradioResponse.data[0];

        // Regex to extract the label and the probability value
        const regex = /(.*?)\s\(prob:\s([\d.]+)\)/;
        const match = resultString.match(regex);

        if (match) {
          const predictionLabel = match[1].trim();
          const probString = match[2];

          // Your model likely returns the probability of the predicted class.
          // Assuming the prediction is P(y=0) "No Disease" if the label is "No Disease".
          const probNoDisease = parseFloat(probString);

          setPrediction({
            prediction_label: predictionLabel,
            probability_of_disease: round(probNoDisease, 4),
            status: "success",
          });
        } else {
          setError("Backend response format was unexpected: " + resultString);
        }
      } else {
        setError(
          gradioResponse.error ||
            "Prediction failed due to an unknown backend error."
        );
      }
    } catch (err) {
      setError(
        "Failed to connect to the prediction service. Check network and ensure the API endpoint is correct."
      );
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  // 🌟 END FIX 3 🌟

  const handleReset = () => {
    setFormData(initialFormData);
    setPrediction(null);
    setError(null);
    setCurrentStep(0);
  };

  const renderCurrentStep = () => {
    const category = STEP_TITLES[currentStep];
    const fields = FIELD_DEFINITIONS[category];

    return (
      <section key={category} className="pb-8 animate-fadeInUp">
        <div className="flex items-center space-x-3 mb-6">
          <SectionIcon category={category} />
          <h2 className="text-xl font-bold text-gray-800">{category}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <CustomInput
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={handleChange}
            />
          ))}
        </div>
      </section>
    );
  };

  const renderResult = useMemo(() => {
    if (!prediction) return null;

    // probability_of_disease is P(y=0) "No Disease" from the backend string
    const probNoDisease = prediction.probability_of_disease;
    const probDisease = round(1 - probNoDisease, 4); // P(y=1) "Disease"

    // Determine the final label based on the calculated probability
    const finalPredictionLabel = probDisease >= 0.5 ? "Disease" : "No Disease";

    // Risk is high if P(y=1) >= 0.5
    const isHighRisk = probDisease >= 0.5;

    const resultColor = isHighRisk
      ? "bg-red-500/10 border-red-500"
      : "bg-green-500/10 border-green-500";
    const textColor = isHighRisk ? "text-red-600" : "text-green-600";
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
          {/* Gauge uses the probability of DISEASE (P(y=1)) */}
          <div className="flex justify-center">
            <RiskGauge probabilityOfDisease={probDisease} />
          </div>

          <div>
            <div
              className={`p-4 rounded-lg shadow-inner ${resultColor} border-l-4`}
            >
              <p className="text-xl font-bold">Predicted Outcome:</p>
              {/* Using the corrected label */}
              <p className={`text-4xl mt-1 font-extrabold ${textColor}`}>
                {finalPredictionLabel}
              </p>
            </div>

            <div className="mt-4 text-gray-700 space-y-2">
              <div className="flex justify-between items-center text-lg font-medium">
                {/* Display P(y=1) */}
                <span>Probability of Disease:</span>
                <span className="font-mono text-indigo-600">{probDisease}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-medium">
                {/* Display P(y=0) */}
                <span>Probability of No Disease:</span>
                <span className="font-mono text-indigo-600">
                  {probNoDisease}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 shadow-sm"
          >
            Start New Prediction
          </button>
        </div>
      </div>
    );
  }, [prediction]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
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
            Follow the 5 steps below to input your data and get a prediction.
          </p>
        </header>

        {/* --- Prediction Result (Shows only on completion) --- */}
        {prediction ? (
          renderResult
        ) : (
          <form
            onSubmit={
              currentStep === STEP_TITLES.length - 1 ? handleSubmit : handleNext
            }
            className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 animate-fadeInUp delay-100"
          >
            {/* --- Step Indicator / Stepper --- */}
            <div className="mb-8 flex justify-between items-center">
              {STEP_TITLES.map((title, index) => (
                <div
                  key={title}
                  className="flex flex-col items-center flex-1 relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold 
                                ${
                                  index <= currentStep
                                    ? "bg-indigo-600"
                                    : "bg-gray-300"
                                } transition-colors duration-300`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs text-center hidden sm:block ${
                      index <= currentStep
                        ? "text-indigo-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {title}
                  </p>
                  {index < STEP_TITLES.length - 1 && (
                    <div
                      className={`absolute left-1/2 top-4 h-0.5 w-full -translate-x-1/2 -z-10 
                                        ${
                                          index < currentStep
                                            ? "bg-indigo-600"
                                            : "bg-gray-300"
                                        } transition-colors duration-300`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-3 transition duration-300">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* --- Current Step Content --- */}
            {renderCurrentStep()}

            {/* --- Navigation Buttons --- */}
            <div className="pt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0 || loading}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150 shadow-sm disabled:opacity-50 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {currentStep < STEP_TITLES.length - 1 ? (
                // Next Button
                <button
                  type="submit"
                  className="px-8 py-3 border border-transparent rounded-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={loading}
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                // Submit Button (Final Step)
                <button
                  type="submit"
                  className="px-8 py-3 border border-transparent rounded-lg text-lg font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    "Get Prediction"
                  )}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer/Disclaimer (Good practice for ML apps) */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Disclaimer: This is a model-based prediction and is not a substitute
            for professional medical advice. Always consult a healthcare
            provider for diagnosis and treatment.
          </p>
        </footer>
      </div>
    </div>
  );
}
