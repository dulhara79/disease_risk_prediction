#!/usr/bin/env python3

import requests
import json

def test_api():
    # Test data from the user (same as Postman request)
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
    
    url = "http://127.0.0.1:8000/predict"
    headers = {"Content-Type": "application/json"}
    
    print("Testing API endpoint...")
    print(f"URL: {url}")
    print(f"Request data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(url, json=test_data, headers=headers)
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ API call successful!")
            print(f"Prediction: {result}")
        else:
            print(f"\n❌ API call failed!")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection failed! Make sure the Flask app is running on port 8000.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_api()