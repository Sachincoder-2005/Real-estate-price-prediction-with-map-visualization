import joblib
import pandas as pd

# Load trained model
model = joblib.load("./models/random_forest_model.pkl")

# Property details
property_data = pd.DataFrame([{
    "area": 1000,
    "locality": "Andheri",
    "city": "Mumbai",
    "property_type": "Apartment",
    "bedroom_num": 2,
    "bathroom_num": 2,
    "balcony_num": 1,
    "furnished": "Furnished",
    "age": 5,
    "total_floors": 10,
    "latitude": 19.1197,
    "longitude": 72.8468
}])

# Predict price
predicted_price = model.predict(property_data)[0]

print("\nProperty Details")
print("----------------")
print("Area:", property_data["area"].iloc[0], "sqft")
print("Location:", property_data["locality"].iloc[0])
print("Bedrooms:", property_data["bedroom_num"].iloc[0])

print("\nPredicted Property Price:")
print("₹", round(predicted_price, 2))