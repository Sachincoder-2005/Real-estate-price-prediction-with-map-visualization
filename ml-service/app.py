from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
app = Flask(__name__)

CORS(app)
MODEL_PATH = "./models/random_forest_model.pkl"

DATASET_PATH = "./dataset/mumbai-house-price-geospatial.csv"
LOCALITY_MODEL_PATH = "./models/locality_avg_price.pkl"

# Load dataset
if os.path.exists(DATASET_PATH):
    property_dataset = pd.read_csv(DATASET_PATH)
else:
    property_dataset = pd.DataFrame()

# Load trained model
model = joblib.load(MODEL_PATH)

# Load locality average price data
if os.path.exists(LOCALITY_MODEL_PATH):
    locality_avg_price = joblib.load(LOCALITY_MODEL_PATH)
else:
    locality_avg_price = {}
    # City centre coordinates
CITY_LAT = 18.9750
CITY_LON = 72.8258


# Calculate distance between two locations
def haversine(lat1, lon1, lat2, lon2):

    R = 6371

    lat1 = np.radians(lat1)
    lat2 = np.radians(lat2)

    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)

    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat1)
        * np.cos(lat2)
        * np.sin(dlon / 2) ** 2
    )

    return 2 * R * np.arcsin(np.sqrt(a))
# Reference transit locations
stations = [
    ("Andheri", 19.1197, 72.8468),
    ("Bandra", 19.0544, 72.8406),
    ("Borivali", 19.2307, 72.8567),
    ("Dadar", 19.0183, 72.8420),
    ("Kurla", 19.0726, 72.8845),
    ("Ghatkopar", 19.0860, 72.9081),
    ("Thane", 19.1859, 72.9753),
    ("Churchgate", 18.9322, 72.8264),
    ("CST", 18.9401, 72.8353),
    ("Powai", 19.1176, 72.9060),
]


station_lat = np.array([x[1] for x in stations])
station_lon = np.array([x[2] for x in stations])


def get_nearest_transit_distance(latitude, longitude):

    distances = haversine(
        latitude,
        longitude,
        station_lat,
        station_lon
    )

    return float(np.min(distances))


# Create Flask application
app = Flask(__name__)
# Load property dataset for nearby comparable properties
dataset_path = "./dataset/mumbai-house-price-data-cleaned.csv"

if os.path.exists(dataset_path):
    property_dataset = pd.read_csv(dataset_path)
else:
    property_dataset = pd.DataFrame()

# Allow React frontend to communicate with Flask
CORS(app)

# Load trained model
model = joblib.load("./models/random_forest_model.pkl")


@app.route("/")
def home():
    return jsonify({
        "message": "Real Estate Price Prediction API is running!"
    })

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get data from frontend
        data = request.get_json()

        # Check if data is received
        if not data:
            return jsonify({
                "success": False,
                "error": "No data received"
            }), 400

        # Required fields
        required_fields = [
            "area",
            "locality",
            "city",
            "property_type",
            "bedroom_num",
            "bathroom_num",
            "balcony_num",
            "furnished",
            "age",
            "total_floors",
            "latitude",
            "longitude"
        ]

        # Check missing fields
        missing_fields = [
            field for field in required_fields
            if field not in data
        ]

        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Missing fields: {', '.join(missing_fields)}"
            }), 400

        # Convert numeric values safely
        try:

            area = float(data["area"])
            bedroom_num = int(data["bedroom_num"])
            bathroom_num = int(data["bathroom_num"])
            balcony_num = int(data["balcony_num"])
            age = int(data["age"])
            total_floors = int(data["total_floors"])
            latitude = float(data["latitude"])
            longitude = float(data["longitude"])

        except (ValueError, TypeError):

            return jsonify({
                "success": False,
                "error": "Invalid numeric value provided"
            }), 400

        # Validate numeric values

        if area <= 0:
            return jsonify({
                "success": False,
                "error": "Area must be greater than 0"
            }), 400

        if bedroom_num < 0:
            return jsonify({
                "success": False,
                "error": "Bedrooms cannot be negative"
            }), 400

        if bathroom_num <= 0:
            return jsonify({
                "success": False,
                "error": "Bathrooms must be greater than 0"
            }), 400

        if balcony_num < 0:
            return jsonify({
                "success": False,
                "error": "Balconies cannot be negative"
            }), 400

        if age < 0:
            return jsonify({
                "success": False,
                "error": "Property age cannot be negative"
            }), 400

        if total_floors <= 0:
            return jsonify({
                "success": False,
                "error": "Total floors must be greater than 0"
            }), 400

        # Validate geographic coordinates

        if not (-90 <= latitude <= 90):
            return jsonify({
                "success": False,
                "error": "Invalid latitude"
            }), 400

        if not (-180 <= longitude <= 180):
            return jsonify({
                "success": False,
                "error": "Invalid longitude"
            }), 400

        # Get locality average price per sqft
        locality = data["locality"]

        if locality in locality_avg_price:
            locality_avg_price_per_sqft = float(
                locality_avg_price[locality]
            )
        else:
            # Fallback to overall average
            if "price_per_sqft" in property_dataset.columns:
                locality_avg_price_per_sqft = float(
                    property_dataset["price_per_sqft"].mean()
                )
            else:
                locality_avg_price_per_sqft = 0.0

        # Calculate distance to city centre
        distance_to_city_center = float(
            haversine(
                latitude,
                longitude,
                CITY_LAT,
                CITY_LON
            )
        )

        # Calculate distance to nearest transit
        distance_to_nearest_transit = get_nearest_transit_distance(
            latitude,
            longitude
        )

        # Create input DataFrame
        property_data = pd.DataFrame([{

            "area": area,

            "bedroom_num": bedroom_num,

            "bathroom_num": bathroom_num,

            "balcony_num": balcony_num,

            "age": age,

            "total_floors": total_floors,

            "latitude": latitude,

            "longitude": longitude,

            "locality_avg_price_per_sqft":
                locality_avg_price_per_sqft,

            "distance_to_city_center":
                distance_to_city_center,

            "distance_to_nearest_transit":
                distance_to_nearest_transit,

            "locality": locality,

            "city": data["city"],

            "property_type": data["property_type"],

            "furnished": data["furnished"]

        }])

        # ==========================================
        # MAIN PREDICTION
        # ==========================================

        predicted_price = float(
            model.predict(property_data)[0]
        )

        # ==========================================
        # PRICE RANGE
        # ==========================================

        price_lower = None
        price_upper = None

        # Check if loaded model is a Random Forest pipeline
        if hasattr(model, "named_steps") and "model" in model.named_steps:

            rf_model = model.named_steps["model"]

            if hasattr(rf_model, "estimators_"):

                # Transform input using pipeline preprocessor
                preprocessor = model.named_steps["preprocessor"]

                transformed_data = preprocessor.transform(
                    property_data
                )

                # Get prediction from every tree
                tree_predictions = np.array([

                    tree.predict(transformed_data)[0]

                    for tree in rf_model.estimators_

                ])

                # Use 10th and 90th percentile
                price_lower = float(
                    np.percentile(tree_predictions, 10)
                )

                price_upper = float(
                    np.percentile(tree_predictions, 90)
                )

        # Fallback price range
        if price_lower is None or price_upper is None:

            price_lower = predicted_price * 0.90

            price_upper = predicted_price * 1.10

        # ==========================================
        # FEATURE IMPORTANCE
        # ==========================================

        feature_importance = []

        try:

            rf_model = model.named_steps["model"]

            preprocessor = model.named_steps["preprocessor"]

            if hasattr(rf_model, "feature_importances_"):

                importances = rf_model.feature_importances_

                transformed_features = (
                    preprocessor.get_feature_names_out()
                )

                importance_df = pd.DataFrame({

                    "feature": transformed_features,

                    "importance": importances

                })

                # Map encoded features to original features
                original_features = {

                    "area": 0.0,

                    "bedroom_num": 0.0,

                    "bathroom_num": 0.0,

                    "balcony_num": 0.0,

                    "age": 0.0,

                    "total_floors": 0.0,

                    "latitude": 0.0,

                    "longitude": 0.0,

                    "locality_avg_price_per_sqft": 0.0,

                    "distance_to_city_center": 0.0,

                    "distance_to_nearest_transit": 0.0,

                    "locality": 0.0,

                    "city": 0.0,

                    "property_type": 0.0,

                    "furnished": 0.0

                }

                for _, row in importance_df.iterrows():

                    feature_name = row["feature"]

                    importance_value = row["importance"]

                    # Remove transformer prefix
                    clean_name = feature_name.split("__")[-1]

                    # Numerical features
                    for original_feature in [

                        "area",

                        "bedroom_num",

                        "bathroom_num",

                        "balcony_num",

                        "age",

                        "total_floors",

                        "latitude",

                        "longitude",

                        "locality_avg_price_per_sqft",

                        "distance_to_city_center",

                        "distance_to_nearest_transit"

                    ]:

                        if clean_name == original_feature:

                            original_features[
                                original_feature
                            ] += importance_value

                    # Categorical features
                    for original_feature in [

                        "locality",

                        "city",

                        "property_type",

                        "furnished"

                    ]:

                        if clean_name.startswith(
                            original_feature + "_"
                        ):

                            original_features[
                                original_feature
                            ] += importance_value

                # Sort by importance
                sorted_features = sorted(

                    original_features.items(),

                    key=lambda x: x[1],

                    reverse=True

                )

                # Top 3 features
                feature_importance = [

                    {
                        "feature": feature,

                        "importance": round(
                            float(importance), 4
                        )
                    }

                    for feature, importance
                    in sorted_features[:3]

                ]

        except Exception:

            feature_importance = []

        # ==========================================
        # SEND RESPONSE
        # ==========================================

        return jsonify({

            "success": True,

            "predicted_price": round(
                predicted_price, 2
            ),

            "price_range": {

                "lower": round(
                    price_lower, 2
                ),

                "upper": round(
                    price_upper, 2
                )

            },

            # Location Analysis
            "distance_to_city_center": round(
                distance_to_city_center, 2
            ),

            "distance_to_nearest_transit": round(
                distance_to_nearest_transit, 2
            ),

            "feature_importance": feature_importance

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 400

@app.route("/nearby-properties", methods=["POST"])
def nearby_properties():
    try:
        data = request.get_json()

        latitude = float(data["latitude"])
        longitude = float(data["longitude"])

        if property_dataset.empty:
            return jsonify({
                "success": False,
                "error": "Property dataset not found"
            }), 500

        nearby = property_dataset.copy()

        # Calculate approximate distance
        nearby["distance"] = (
            (nearby["latitude"] - latitude) ** 2 +
            (nearby["longitude"] - longitude) ** 2
        ) ** 0.5

        # Get nearest 20 properties
        nearby = nearby.sort_values("distance").head(20)

        properties = []

        for _, row in nearby.iterrows():
            properties.append({
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "price": float(row["price"]),
                "area": float(row["area"]),
                "locality": str(row["locality"]),
                "property_type": str(row["property_type"]),
                "bedrooms": int(row["bedroom_num"])
            })

        return jsonify({
            "success": True,
            "properties": properties
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

@app.route("/heatmap-data", methods=["GET"])
def heatmap_data():
    try:
        df = pd.read_csv(
            "./dataset/mumbai-house-price-data-cleaned.csv"
        )

        # Only valid location and price data
        df = df[
            df["latitude"].notna()
            & df["longitude"].notna()
            & df["price"].notna()
        ]

        # Use 3000 random properties
        # so browser does not receive all 71,938 rows
        sample_size = min(3000, len(df))

        df = df.sample(
            sample_size,
            random_state=42
        )

        data = df[
            ["latitude", "longitude", "price"]
        ].to_dict(orient="records")

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)