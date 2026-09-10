import pandas as pd
import numpy as np
import pickle
import os

DATASET = "./dataset/mumbai-house-price-data-cleaned.csv"

CITY_LAT = 18.9750
CITY_LON = 72.8258


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


def create_features():

    df = pd.read_csv(DATASET)

    # 1. Locality average price per sqft
    locality_avg = (
        df.groupby("locality")["price_per_sqft"]
        .mean()
        .to_dict()
    )

    df["locality_avg_price_per_sqft"] = (
        df["locality"].map(locality_avg)
    )

    # 2. Distance to city centre
    df["distance_to_city_center"] = haversine(
        df["latitude"],
        df["longitude"],
        CITY_LAT,
        CITY_LON
    )

    # 3. Transit stations
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

    def nearest_transit(row):
        distances = haversine(
            row["latitude"],
            row["longitude"],
            station_lat,
            station_lon
        )
        return np.min(distances)

    df["distance_to_nearest_transit"] = df.apply(
        nearest_transit,
        axis=1
    )

    # Save processed dataset
    output = "./dataset/mumbai-house-price-geospatial.csv"
    df.to_csv(output, index=False)

    # Save locality mapping
    os.makedirs("./models", exist_ok=True)

    with open("./models/locality_avg_price.pkl", "wb") as f:
        pickle.dump(locality_avg, f)

    print("Geospatial features created successfully!")
    print(df[
        [
            "locality",
            "locality_avg_price_per_sqft",
            "distance_to_city_center",
            "distance_to_nearest_transit"
        ]
    ].head())

    print("\nDataset shape:", df.shape)
    print("\nMissing values:")
    print(df[
        [
            "locality_avg_price_per_sqft",
            "distance_to_city_center",
            "distance_to_nearest_transit"
        ]
    ].isnull().sum())


if __name__ == "__main__":
    create_features()
    