import pandas as pd

# 1. Load dataset
DATA_PATH =  "./dataset/mumbai-house-price-geospatial.csv"

df = pd.read_csv(DATA_PATH)

print("Original dataset shape:", df.shape)

# 2. Remove rows with invalid values
df = df[
    (df["price"] > 0) &
    (df["area"] > 0) &
    (df["bedroom_num"] >= 0) &
    (df["bathroom_num"] > 0) &
    (df["balcony_num"] >= 0) &
    (df["age"] >= 0) &
    (df["total_floors"] > 0)
]

print("After basic cleaning:", df.shape)

# 3. Check missing values
print("\nMissing values:")
print(df.isnull().sum())

# 4. Show first 5 rows
print("\nFirst 5 rows:")
print(df.head())

# 5. Remove columns that should not be used for prediction
df = df.drop(columns=["title", "price_per_sqft"])

# 6. Separate features and target
X = df.drop(columns=["price"])
y = df["price"]

print("\nFeature columns:")
print(X.columns.tolist())

print("\nTarget column:")
print(y.name)

print("\nFeature shape:", X.shape)
print("Target shape:", y.shape)

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

# 7. Define categorical and numerical columns

categorical_features = [
    "locality",
    "city",
    "property_type",
    "furnished"
]

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

# 8. Create preprocessing pipeline

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)

# 9. Split dataset into training and testing data

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining data:", X_train.shape)
print("Testing data:", X_test.shape)

print("\nPreprocessing setup completed!")

from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

# 10. Create Linear Regression pipeline

linear_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", LinearRegression())
    ]
)

# 11. Train Linear Regression model

print("\nTraining Linear Regression model...")

linear_model.fit(X_train, y_train)

print("Linear Regression training completed!")

# 12. Make predictions

y_pred = linear_model.predict(X_test)

# 13. Evaluate model

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\nLinear Regression Results")
print("-------------------------")
print("MAE :", mae)
print("RMSE:", rmse)
print("R2  :", r2)

from sklearn.ensemble import RandomForestRegressor

# 14. Create Random Forest pipeline

random_forest_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
           RandomForestRegressor(
    n_estimators=30,
    max_depth=20,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
        )
    ]
)

# 15. Train Random Forest

print("\nTraining Random Forest model...")

random_forest_model.fit(X_train, y_train)

print("Random Forest training completed!")

# 16. Make predictions

rf_pred = random_forest_model.predict(X_test)

# 17. Evaluate Random Forest

rf_mae = mean_absolute_error(y_test, rf_pred)
rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
rf_r2 = r2_score(y_test, rf_pred)

print("\nRandom Forest Results")
print("--------------------")
print("MAE :", rf_mae)
print("RMSE:", rf_rmse)
print("R2  :", rf_r2)


from xgboost import XGBRegressor

# 18. Create XGBoost pipeline

xgb_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
            XGBRegressor(
                n_estimators=300,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1,
                objective="reg:squarederror"
            )
        )
    ]
)

# 19. Train XGBoost

print("\nTraining XGBoost model...")

xgb_model.fit(X_train, y_train)

print("XGBoost training completed!")

# 20. Make predictions

xgb_pred = xgb_model.predict(X_test)

# 21. Evaluate XGBoost

xgb_mae = mean_absolute_error(y_test, xgb_pred)
xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))
xgb_r2 = r2_score(y_test, xgb_pred)

print("\nXGBoost Results")
print("----------------")
print("MAE :", xgb_mae)
print("RMSE:", xgb_rmse)
print("R2  :", xgb_r2)

# 22. Compare all models

results = {
    "Linear Regression": {
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2
    },
    "Random Forest": {
        "MAE": rf_mae,
        "RMSE": rf_rmse,
        "R2": rf_r2
    },
    "XGBoost": {
        "MAE": xgb_mae,
        "RMSE": xgb_rmse,
        "R2": xgb_r2
    }
}

print("\n================ MODEL COMPARISON ================")

for model_name, metrics in results.items():
    print(f"\n{model_name}")
    print(f"MAE  : {metrics['MAE']:,.2f}")
    print(f"RMSE : {metrics['RMSE']:,.2f}")
    print(f"R2   : {metrics['R2']:.4f}")

# 23. Select best model based on highest R2

best_model_name = max(
    results,
    key=lambda model_name: results[model_name]["R2"]
)

print("\n====================================================")
print("BEST MODEL:", best_model_name)
print("====================================================")

# 24. Select actual trained model

models = {
    "Linear Regression": linear_model,
    "Random Forest": random_forest_model,
    "XGBoost": xgb_model
}

best_model = models[best_model_name]

# 25. Save best model

import joblib
import os

os.makedirs("./models", exist_ok=True)

joblib.dump(
    best_model,
    "./models/random_forest_model.pkl"
)

print("\nBest model saved successfully!")
print("Selected model:", best_model_name)
print("Location: ./models/random_forest_model.pkl")

print("\n========== MODEL RESULTS FOR PROJECT REPORT ==========")
print(f"{'Model':<22} {'RMSE (₹ lakh)':>15} {'MAE (₹ lakh)':>15} {'R² Score':>12}")
print("-" * 68)

for model_name, metrics in results.items():
    print(
        f"{model_name:<22} "
        f"{metrics['RMSE'] / 100000:>15.2f} "
        f"{metrics['MAE'] / 100000:>15.2f} "
        f"{metrics['R2']:>12.4f}"
    )

print("\nBest Performing Model:", best_model_name)
print(f"R² Percentage: {results[best_model_name]['R2'] * 100:.2f}%")
# 26. Random Forest Feature Importance Graph

import matplotlib.pyplot as plt

# Get the trained Random Forest model
rf = random_forest_model.named_steps["model"]

# Get feature names after preprocessing
feature_names = random_forest_model.named_steps[
    "preprocessor"
].get_feature_names_out()

# Get importance values
importances = rf.feature_importances_

# Combine encoded categories into original feature groups
importance_df = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importances
})

importance_df["Feature"] = (
    importance_df["Feature"]
    .str.replace("categorical__", "", regex=False)
    .str.replace("numerical__", "", regex=False)
)

importance_df["Feature"] = importance_df["Feature"].apply(
    lambda f: (
        "Locality"
        if f.startswith("locality_")
        else "City"
        if f.startswith("city_")
        else "Property Type"
        if f.startswith("property_type_")
        else "Furnishing Status"
        if f.startswith("furnished_")
        else f
    )
)

importance_df = (
    importance_df.groupby("Feature", as_index=False)["Importance"]
    .sum()
    .sort_values("Importance", ascending=False)
    .head(8)
    .sort_values("Importance")
)

# Draw graph
plt.figure(figsize=(10, 6))
bars = plt.barh(
    importance_df["Feature"],
    importance_df["Importance"]
)

plt.bar_label(bars, fmt="%.3f", padding=4)
plt.xlabel("Relative Feature Importance")
plt.title("Feature Importance – Selected Model (Random Forest)")
plt.tight_layout()

plt.savefig(
    "random_forest_feature_importance.png",
    dpi=300,
    bbox_inches="tight"
)

plt.show()

print("Random Forest feature importance graph saved!")

import matplotlib.pyplot as plt

rf = random_forest_model.named_steps["model"]
feature_names = random_forest_model.named_steps["preprocessor"].get_feature_names_out()

importance_df = pd.DataFrame({
    "Feature": feature_names,
    "Importance": rf.feature_importances_
})

importance_df["Feature"] = (
    importance_df["Feature"]
    .str.replace("numerical__", "", regex=False)
    .str.replace("categorical__", "", regex=False)
)

importance_df = importance_df.nlargest(8, "Importance")
importance_df = importance_df.sort_values("Importance")

plt.figure(figsize=(10, 6))
plt.barh(importance_df["Feature"], importance_df["Importance"], color="seagreen")

for i, value in enumerate(importance_df["Importance"]):
    plt.text(value + 0.002, i, f"{value:.3f}", va="center")

plt.xlabel("Relative Feature Importance")
plt.title("Figure 14: Feature Importance - Random Forest")
plt.tight_layout()
plt.savefig("random_forest_feature_importance.png", dpi=300)
plt.show()
