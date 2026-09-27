from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import pandas as pd
import numpy as np
import os
import re


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# PATHS
# ============================================================

MODEL_PATH = "./models/random_forest_model.pkl"

DATASET_PATH = "./dataset/mumbai-house-price-data-cleaned.csv"

LOCALITY_MODEL_PATH = "./models/locality_avg_price.pkl"


# ============================================================
# LOAD PROPERTY DATASET
# ============================================================

if os.path.exists(DATASET_PATH):
    property_dataset = pd.read_csv(DATASET_PATH)
else:
    property_dataset = pd.DataFrame()


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    model = None


# ============================================================
# LOAD LOCALITY AVERAGE PRICE DATA
# ============================================================

if os.path.exists(LOCALITY_MODEL_PATH):
    locality_avg_price = joblib.load(LOCALITY_MODEL_PATH)
else:
    locality_avg_price = {}


# ============================================================
# CITY CENTRE COORDINATES
# ============================================================

CITY_LAT = 18.9750
CITY_LON = 72.8258


# ============================================================
# HAVERSINE DISTANCE FUNCTION
# ============================================================

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


# ============================================================
# REFERENCE TRANSIT LOCATIONS
# ============================================================

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


# ============================================================
# NEAREST TRANSIT DISTANCE
# ============================================================

def get_nearest_transit_distance(latitude, longitude):

    distances = haversine(
        latitude,
        longitude,
        station_lat,
        station_lon
    )

    return float(np.min(distances))


# ============================================================
# HOME ROUTE
# ============================================================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "Real Estate Price Prediction API is running!"
    })


# ============================================================
# PREDICT ROUTE
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # ----------------------------------------------------
        # Check model
        # ----------------------------------------------------

        if model is None:

            return jsonify({
                "success": False,
                "error": "Trained model not found"
            }), 500


        # ----------------------------------------------------
        # Get JSON data
        # ----------------------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "error": "No data received"
            }), 400


        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # Check missing fields
        # ----------------------------------------------------

        missing_fields = [
            field
            for field in required_fields
            if field not in data
        ]


        if missing_fields:

            return jsonify({
                "success": False,
                "error": f"Missing fields: {', '.join(missing_fields)}"
            }), 400


        # ----------------------------------------------------
        # Convert numeric values
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # Validate values
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # Validate coordinates
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # Locality average price
        # ----------------------------------------------------

        locality = str(data["locality"]).strip()


        if locality in locality_avg_price:

            locality_avg_price_per_sqft = float(
                locality_avg_price[locality]
            )

        else:

            if (
                not property_dataset.empty
                and "price_per_sqft" in property_dataset.columns
            ):

                locality_avg_price_per_sqft = float(
                    property_dataset["price_per_sqft"].mean()
                )

            else:

                locality_avg_price_per_sqft = 0.0


        # ----------------------------------------------------
        # Distance to city centre
        # ----------------------------------------------------

        distance_to_city_center = float(
            haversine(
                latitude,
                longitude,
                CITY_LAT,
                CITY_LON
            )
        )


        # ----------------------------------------------------
        # Distance to nearest transit
        # ----------------------------------------------------

        distance_to_nearest_transit = get_nearest_transit_distance(
            latitude,
            longitude
        )


        # ----------------------------------------------------
        # Create input DataFrame
        # ----------------------------------------------------

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


        # ====================================================
        # MAIN PREDICTION
        # ====================================================

        predicted_price = float(
            model.predict(property_data)[0]
        )


        # ====================================================
        # PRICE RANGE
        # ====================================================

        price_lower = None
        price_upper = None


        if (
            hasattr(model, "named_steps")
            and "model" in model.named_steps
        ):

            rf_model = model.named_steps["model"]


            if hasattr(rf_model, "estimators_"):

                if "preprocessor" in model.named_steps:

                    preprocessor = model.named_steps["preprocessor"]


                    transformed_data = preprocessor.transform(
                        property_data
                    )


                    tree_predictions = np.array([

                        tree.predict(transformed_data)[0]

                        for tree in rf_model.estimators_

                    ])


                    price_lower = float(
                        np.percentile(tree_predictions, 10)
                    )


                    price_upper = float(
                        np.percentile(tree_predictions, 90)
                    )


        # ----------------------------------------------------
        # Fallback price range
        # ----------------------------------------------------

        if price_lower is None or price_upper is None:

            price_lower = predicted_price * 0.90

            price_upper = predicted_price * 1.10


        # ====================================================
        # FEATURE IMPORTANCE
        # ====================================================

        feature_importance = []


        try:

            if (
                hasattr(model, "named_steps")
                and "model" in model.named_steps
                and "preprocessor" in model.named_steps
            ):

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


                    # ------------------------------------------------
                    # Original feature dictionary
                    # ------------------------------------------------

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


                    # ------------------------------------------------
                    # Map feature importance
                    # ------------------------------------------------

                    for _, row in importance_df.iterrows():

                        feature_name = row["feature"]

                        importance_value = row["importance"]


                        clean_name = feature_name.split("__")[-1]


                        numerical_features = [

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

                        ]


                        for original_feature in numerical_features:

                            if clean_name == original_feature:

                                original_features[
                                    original_feature
                                ] += importance_value


                        categorical_features = [

                            "locality",

                            "city",

                            "property_type",

                            "furnished"

                        ]


                        for original_feature in categorical_features:

                            if clean_name.startswith(
                                original_feature + "_"
                            ):

                                original_features[
                                    original_feature
                                ] += importance_value


                    # ------------------------------------------------
                    # Sort
                    # ------------------------------------------------

                    sorted_features = sorted(

                        original_features.items(),

                        key=lambda x: x[1],

                        reverse=True

                    )


                    # ------------------------------------------------
                    # Top 3
                    # ------------------------------------------------

                    feature_importance = [

                        {

                            "feature": feature,

                            "importance": round(
                                float(importance),
                                4
                            )

                        }

                        for feature, importance
                        in sorted_features[:3]

                    ]


        except Exception:

            feature_importance = []


        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "success": True,

            "predicted_price": round(
                predicted_price,
                2
            ),

            "price_range": {

                "lower": round(
                    price_lower,
                    2
                ),

                "upper": round(
                    price_upper,
                    2
                )

            },

            "distance_to_city_center": round(
                distance_to_city_center,
                2
            ),

            "distance_to_nearest_transit": round(
                distance_to_nearest_transit,
                2
            ),

            "feature_importance":
                feature_importance

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# NEARBY PROPERTIES
# ============================================================

@app.route("/nearby-properties", methods=["POST"])
def nearby_properties():

    try:

        data = request.get_json()


        if not data:

            return jsonify({
                "success": False,
                "error": "No data received"
            }), 400


        latitude = float(data["latitude"])

        longitude = float(data["longitude"])


        if property_dataset.empty:

            return jsonify({

                "success": False,

                "error": "Property dataset not found"

            }), 500


        # ----------------------------------------------------
        # Copy dataset
        # ----------------------------------------------------

        nearby = property_dataset.copy()


        # ----------------------------------------------------
        # Calculate approximate distance
        # ----------------------------------------------------

        nearby["distance"] = (

            (nearby["latitude"] - latitude) ** 2

            +

            (nearby["longitude"] - longitude) ** 2

        ) ** 0.5


        # ----------------------------------------------------
        # Nearest 20
        # ----------------------------------------------------

        nearby = (
            nearby
            .sort_values("distance")
            .head(20)
        )


        properties = []


        for _, row in nearby.iterrows():

            properties.append({

                "latitude": float(
                    row["latitude"]
                ),

                "longitude": float(
                    row["longitude"]
                ),

                "price": float(
                    row["price"]
                ),

                "area": float(
                    row["area"]
                ),

                "locality": str(
                    row["locality"]
                ),

                "property_type": str(
                    row["property_type"]
                ),

                "bedrooms": int(
                    row["bedroom_num"]
                )

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


# ============================================================
# HEATMAP DATA
# ============================================================

@app.route("/heatmap-data", methods=["GET"])
def heatmap_data():

    try:

        if property_dataset.empty:

            return jsonify({

                "success": False,

                "error": "Property dataset not found"

            }), 500


        df = property_dataset.copy()


        # ----------------------------------------------------
        # Valid location and price
        # ----------------------------------------------------

        df = df[

            df["latitude"].notna()

            & df["longitude"].notna()

            & df["price"].notna()

        ]


        # ----------------------------------------------------
        # Maximum 3000 properties
        # ----------------------------------------------------

        sample_size = min(
            3000,
            len(df)
        )


        if sample_size > 0:

            df = df.sample(

                sample_size,

                random_state=42

            )


        data = df[

            [
                "latitude",
                "longitude",
                "price"
            ]

        ].to_dict(
            orient="records"
        )


        return jsonify({

            "success": True,

            "data": data

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# PROPERTY ASSISTANT
# ============================================================

@app.route("/assistant", methods=["POST"])
def property_assistant():

    try:

        # ----------------------------------------------------
        # Get request data
        # ----------------------------------------------------

        data = request.get_json()


        if not data:

            return jsonify({

                "success": False,

                "error": "No data received"

            }), 400


        query = data.get(
            "query",
            ""
        ).strip()


        if not query:

            return jsonify({

                "success": False,

                "error":
                    "Please enter your property requirement"

            }), 400


        text = query.lower()


        # ====================================================
        # 1. EXTRACT BHK
        # ====================================================

        bhk_match = re.search(
            r'(\d+)\s*bhk\b',
            text
        )


        if bhk_match:

            bedrooms = int(
                bhk_match.group(1)
            )

        else:

            bedrooms = None


        # ====================================================
        # 2. EXTRACT BUDGET
        # ====================================================

        budget = None


        # Example:
        # 1 crore
        # ₹1 crore
        # 1.5 crore
        # 2 cr

        crore_match = re.search(

            r'₹?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)\b',

            text

        )


        # Example:
        # 50 lakh
        # ₹50 lakh
        # 75 lac
        # 90 l

        lakh_match = re.search(

            r'₹?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b',

            text

        )


        if crore_match:

            budget = (
                float(crore_match.group(1))
                * 10_000_000
            )


        elif lakh_match:

            budget = (
                float(lakh_match.group(1))
                * 100_000
            )


        # ====================================================
        # 3. DETECT LOCALITY
        # ====================================================

        localities = [

            "andheri",

            "bandra",

            "borivali",

            "dadar",

            "kurla",

            "ghatkopar",

            "thane",

            "powai",

            "churchgate",

            "cst",

            "malad",

            "goregaon",

            "jogeshwari",

            "kandivali",

            "vile parle",

            "chembur"

        ]


        selected_locality = None


        for locality in localities:

            if locality in text:

                selected_locality = locality

                break


        # ====================================================
        # 4. FILTER DATASET
        # ====================================================

        results = property_dataset.copy()


        # ----------------------------------------------------
        # Filter by bedrooms
        # ----------------------------------------------------

        if bedrooms is not None:

            if "bedroom_num" in results.columns:

                results = results[
                    results["bedroom_num"]
                    == bedrooms
                ]


        # ----------------------------------------------------
        # Filter by budget
        # ----------------------------------------------------

        if budget is not None:

            if "price" in results.columns:

                results = results[
                    results["price"]
                    <= budget
                ]


        # ----------------------------------------------------
        # Filter by locality
        # ----------------------------------------------------

        if selected_locality:

            if "locality" in results.columns:

                locality_mask = (

                    results["locality"]

                    .astype(str)

                    .str.lower()

                    .str.contains(

                        selected_locality,

                        na=False

                    )

                )


                # Only apply locality filter
                # if matching properties exist

                if locality_mask.any():

                    results = results[
                        locality_mask
                    ]


        # ====================================================
        # 5. SORT BY PRICE
        # ====================================================

        if "price" in results.columns:

            results = (

                results

                .sort_values("price")

                .head(10)

            )


        # ====================================================
        # 6. CREATE PROPERTY RESPONSE
        # ====================================================

        properties = []


        for _, row in results.iterrows():

            properties.append({

                "title": str(
                    row.get(
                        "title",
                        "Property"
                    )
                ),

                "price": float(
                    row["price"]
                ),

                "area": float(
                    row["area"]
                ),

                "locality": str(
                    row["locality"]
                ),

                "property_type": str(
                    row["property_type"]
                ),

                "bedrooms": int(
                    row["bedroom_num"]
                ),

                "bathrooms": int(
                    row["bathroom_num"]
                ),

                "latitude": float(
                    row["latitude"]
                ),

                "longitude": float(
                    row["longitude"]
                )

            })


        # ====================================================
        # 7. SEND RESPONSE
        # ====================================================

        return jsonify({

            "success": True,

            "query": query,

            "filters": {

                "budget": budget,

                "bedrooms": bedrooms,

                "locality": selected_locality

            },

            "count": len(properties),

            "properties": properties

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# RUN FLASK SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )