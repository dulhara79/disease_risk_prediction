// Validation script to check if frontend fields match backend requirements

const USER_INPUT_COLUMNS = [
    'gender', 'age', 'blood_pressure', 'heart_rate', 'glucose', 'insulin', 'cholesterol', 'bmi',
    'physical_activity', 'waist_size', 'calorie_intake', 'mental_health_score', 'sugar_intake',
    'smoking_status', 'alcohol_consumption', 'stress_level', 'income',
    'marital_status', 'exercise_type', 'dietary_habits', 'caffeine_intake',
    'water_intake', 'work_hours'
];

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
    { id: 'cholesterol', label: 'Total Cholesterol (mg/dL)', type: 'number', min: 100, max: 400, placeholder: 'e.g., 210.5' },
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

// Extract all frontend field IDs
const frontendFields = Object.values(FIELD_DEFINITIONS).flat().map(field => field.id);

console.log('Backend required fields:', USER_INPUT_COLUMNS.length);
console.log('Frontend available fields:', frontendFields.length);

console.log('\nBackend fields:', USER_INPUT_COLUMNS.sort());
console.log('\nFrontend fields:', frontendFields.sort());

// Check for missing fields
const missingInFrontend = USER_INPUT_COLUMNS.filter(field => !frontendFields.includes(field));
const extraInFrontend = frontendFields.filter(field => !USER_INPUT_COLUMNS.includes(field));

if (missingInFrontend.length > 0) {
    console.log('\n❌ Missing in frontend:', missingInFrontend);
} else {
    console.log('\n✅ All backend fields are present in frontend');
}

if (extraInFrontend.length > 0) {
    console.log('⚠️ Extra fields in frontend (not needed by backend):', extraInFrontend);
} else {
    console.log('✅ No extra fields in frontend');
}

if (missingInFrontend.length === 0 && extraInFrontend.length === 0) {
    console.log('\n🎉 Perfect match! Frontend and backend fields are synchronized.');
}