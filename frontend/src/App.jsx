import { useState, useEffect } from "react";
import Signup from "./Signup";
import Login from "./Login";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
import "./App.css";
import jsPDF from "jspdf";
import { supabase } from "./supabaseClient";



import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
    useMap,
} from "react-leaflet";

function LocationSelector({ setFormData }) {
  useMapEvents({
    async click(e) {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));

      // Latitude and Longitude update
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );

        const data = await response.json();

        console.log("LOCATION DATA:", data);

        const address = data.address || {};

        const locality =
          address.suburb ||
          address.neighbourhood ||
          address.city_district ||
          address.town ||
          address.city ||
          "Mumbai";

        setFormData((prev) => ({
          ...prev,
          locality: locality,
        }));

      } catch (error) {
        console.error("Location error:", error);
      }
    },
  });

  return null;
}

function MapCenter({ latitude, longitude }) {
  const map = useMap();

  map.setView([latitude, longitude]);

  return null;
}

function HeatmapLayer({ properties, showHeatmap }) {
  const map = useMap();

  useEffect(() => {
    if (!showHeatmap || !properties.length) {
      return;
    }

    const heatData = properties
      .filter(
        (property) =>
          Number.isFinite(Number(property.latitude)) &&
          Number.isFinite(Number(property.longitude)) &&
          Number.isFinite(Number(property.price))
      )
      .map((property) => [
        Number(property.latitude),
        Number(property.longitude),
        0.5,
      ]);

    if (heatData.length === 0) {
      return;
    }

    const heatLayer = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 13,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, properties, showHeatmap]);

  return null;
}
function App() {
 const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({
    area: "",
    locality: "Andheri",
    city: "Mumbai",
    property_type: "Apartment",
    bedroom_num: 2,
    bathroom_num: 2,
    balcony_num: 1,
    furnished: "Furnished",
    age: 5,
    total_floors: 10,
    latitude: 19.1197,
    longitude: 72.8468,
  });
  useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      setAuthMode("app");
    }
  };

  checkSession();
}, []);
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  setAuthMode("login");
};
  const [price, setPrice] = useState(null);
  const [priceRange, setPriceRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [featureImportance, setFeatureImportance] = useState([]);
const [nearbyProperties, setNearbyProperties] = useState([]);
const [heatmapProperties, setHeatmapProperties] = useState([]);
const [showHeatmap, setShowHeatmap] = useState(false);

const [locationAnalysis, setLocationAnalysis] = useState({
  distance_to_city_center: null,
  distance_to_nearest_transit: null,
});

  const [history, setHistory] = useState(() => {
  const savedHistory = localStorage.getItem("propertyHistory");

  return savedHistory ? JSON.parse(savedHistory) : [];
});

const [searchTerm, setSearchTerm] = useState("");
const [locationSearch, setLocationSearch] = useState("");
const [selectedHistory, setSelectedHistory] = useState(null);

useEffect(() => {
  localStorage.setItem(
    "propertyHistory",
    JSON.stringify(history)
  );
}, [history]);
useEffect(() => {
  const fetchHeatmapData = async () => {
    try {
      const response = await fetch(
        "https://real-estate-price-predictor-api.onrender.com/heatmap-data"
      );

      const data = await response.json();

      if (data.success) {
        setHeatmapProperties(data.data || []);
      }
    } catch (error) {
      console.error("Heatmap data error:", error);
    }
  };

  fetchHeatmapData();
}, []);

const filteredHistory = history.filter((item) =>
  `${item.locality} ${item.city}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
const totalPredictions = history.length;

const averagePrice =
  history.length > 0
    ? history.reduce((sum, item) => sum + Number(item.price), 0) /
      history.length
    : 0;

const highestPrice =
  history.length > 0
    ? Math.max(...history.map((item) => Number(item.price)))
    : 0;

    const resetPrediction = () => {
  setFormData({
    area: "",
    locality: "Andheri",
    city: "Mumbai",
    property_type: "Apartment",
    bedroom_num: 2,
    bathroom_num: 2,
    balcony_num: 1,
    furnished: "Furnished",
    age: 5,
    total_floors: 10,
    latitude: 19.1197,
    longitude: 72.8468,
  });

setPrice(null);
setPriceRange(null);
setFeatureImportance([]);
setError("");
};

const searchLocation = async () => {
  if (!locationSearch.trim()) {
    alert("Pehle location ka naam enter karo.");
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationSearch + ", Mumbai"
      )}&limit=1`
    );

    const data = await response.json();

    console.log("SEARCH LOCATION:", data);

    if (data.length === 0) {
      alert("Location nahi mili.");
      return;
    }

    const latitude = Number(Number(data[0].lat).toFixed(6));
    const longitude = Number(Number(data[0].lon).toFixed(6));

    setFormData((prev) => ({
      ...prev,
      latitude: latitude,
      longitude: longitude,
      locality: locationSearch,
    }));

  } catch (error) {
    console.error("Location search error:", error);
    alert("Location search nahi ho paayi.");
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generatePDF = () => {
  if (!price) {
    alert("Please predict the property price first.");
    return;
  }

  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const C = {
    navy: [23, 32, 51],
    blue: [49, 90, 138],
    light: [243, 246, 250],
    grey: [102, 112, 133],
    dark: [39, 49, 66],
    border: [217, 224, 232],
  };

  const money = v =>
    `Rs. ${Number(v || 0).toLocaleString("en-IN")}`;

  const featureName = v =>
    String(v || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, x => x.toUpperCase());

  const header = (title, page) => {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("REAL ESTATE PRICE PREDICTOR", 18, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("WITH MAP VISUALIZATION", 18, 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, W - 18, 16, { align: "right" });

    doc.setTextColor(...C.grey);
    doc.setFontSize(7);
    doc.text(
      "Real Estate Price Predictor with Map Visualization",
      18, H - 10
    );
    doc.text(`Page ${page} of 2`, W - 18, H - 10, {
      align: "right"
    });
  };

  const section = (title, y) => {
    doc.setTextColor(...C.blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 18, y);

    doc.setDrawColor(...C.border);
    doc.line(18, y + 3, W - 18, y + 3);

    return y + 14;
  };

  // ================= PAGE 1 =================

  header("PROPERTY VALUATION", 1);

  let y = 48;

  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Property Valuation Report", 18, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.grey);
  doc.text(
    "Detailed estimated valuation based on submitted property information",
    18, y + 7
  );

  y = section("PROPERTY OVERVIEW", 68);

  const details = [
    ["Locality", formData.locality],
    ["City", formData.city],
    ["Property Type", formData.property_type],
    ["Area", `${formData.area} sqft`],
    ["Bedrooms", formData.bedroom_num],
    ["Bathrooms", formData.bathroom_num],
    ["Balconies", formData.balcony_num],
    ["Furnishing", formData.furnished],
    ["Property Age", `${formData.age} years`],
    ["Total Floors", formData.total_floors],
  ];

  details.forEach((item, i) => {
    const x = i % 2 ? 108 : 18;
    const valueX = i % 2 ? 142 : 52;
    const rowY = 80 + Math.floor(i / 2) * 12;

    doc.setFillColor(...C.light);
    doc.rect(x, rowY - 5, 84, 10, "F");

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(item[0], x + 2, rowY + 1);

    doc.setFont("helvetica", "normal");
    doc.text(String(item[1] || "N/A"), valueX, rowY + 1);
  });

  // Valuation box
  y = 150;

  doc.setFillColor(...C.light);
  doc.roundedRect(18, y, 174, 43, 4, 4, "F");

  doc.setTextColor(...C.grey);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ESTIMATED PROPERTY VALUE", 25, y + 10);

  doc.setTextColor(...C.navy);
  doc.setFontSize(19);
  doc.text(money(price), 25, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.grey);
  doc.text("Indicative model-based valuation", 25, y + 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ESTIMATED PRICE RANGE", 110, y + 10);

  doc.setTextColor(...C.dark);
  doc.setFontSize(10);

  if (priceRange) {
    doc.text(
      `${money(priceRange.lower)} -`,
      110, y + 20
    );
    doc.text(
      money(priceRange.upper),
      110, y + 28
    );
  } else {
    doc.text("Not available", 110, y + 21);
  }

  // Price analysis
  y = section("PRICE ANALYSIS", 210);

  const pricePerSqft =
    formData.area > 0
      ? Math.round(Number(price) / Number(formData.area))
      : null;

  doc.setFillColor(...C.light);
  doc.roundedRect(18, y, 174, 20, 3, 3, "F");

  doc.setTextColor(...C.grey);
  doc.setFontSize(8);
  doc.text("PRICE PER SQUARE FOOT", 25, y + 8);

  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(pricePerSqft ? money(pricePerSqft) : "N/A", 25, y + 16);

  // Location
  y = section("LOCATION INFORMATION", y + 35);

  [
    ["Locality", formData.locality],
    ["City", formData.city],
    ["Latitude", formData.latitude],
    ["Longitude", formData.longitude],
  ].forEach((item, i) => {
    const yy = y + i * 10;

    doc.setFillColor(...C.light);
    doc.rect(18, yy - 5, 48, 9, "F");

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(item[0], 21, yy + 1);

    doc.setFont("helvetica", "normal");
    doc.text(String(item[1] || "N/A"), 72, yy + 1);
  });

  // Insight
  y = section("VALUATION INSIGHT", y + 55);

  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  const insight = doc.splitTextToSize(
    `Based on the submitted property characteristics and historical ` +
    `real-estate data, the system estimates the property's market value ` +
    `at ${money(price)}. The estimated range provides an indicative ` +
    `valuation interval based on model predictions.`,
    W - 36
  );

  doc.text(insight, 18, y);

  // ================= PAGE 2 =================

  doc.addPage();
  header("ANALYSIS & COMPARABLES", 2);

  y = 48;

  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Prediction Analysis", 18, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.grey);
  doc.text(
    "Important prediction factors and nearby comparable properties",
    18, y + 7
  );

  // Features
  y = section("TOP IMPORTANT FEATURES", 77);

  (featureImportance || []).slice(0, 3).forEach(item => {
    const value = Math.max(
      0,
      Math.min(1, Number(item.importance) || 0)
    );

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(featureName(item.feature), 20, y);

    doc.text(
      `${(value * 100).toFixed(1)}%`,
      W - 20, y,
      { align: "right" }
    );

    doc.setFillColor(...C.border);
    doc.roundedRect(20, y + 3, 160, 4, 2, 2, "F");

    doc.setFillColor(...C.blue);
    doc.roundedRect(
      20, y + 3, 160 * value, 4, 2, 2, "F"
    );

    y += 16;
  });

  // Comparable properties
  y = section("NEARBY COMPARABLE PROPERTIES", y + 8);

  const cols = [
    ["Locality", 18],
    ["Area", 63],
    ["BHK", 93],
    ["Type", 111],
    ["Price", 147],
  ];

  doc.setFillColor(...C.navy);
  doc.rect(18, y, 174, 9, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);

  cols.forEach(([name, x]) => doc.text(name, x + 2, y + 6));

  y += 9;

  (nearbyProperties || []).slice(0, 6).forEach((p, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...C.light);
      doc.rect(18, y, 174, 9, "F");
    }

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.text(String(p.locality || "N/A").slice(0, 20), 20, y + 6);
    doc.text(`${p.area || "N/A"} sqft`, 65, y + 6);
    doc.text(String(p.bedrooms || "N/A"), 96, y + 6);
    doc.text(String(p.property_type || "N/A").slice(0, 16), 113, y + 6);
    doc.text(money(p.price), 147, y + 6);

    y += 9;
  });

  // Map
  y = section("LOCATION & COMPARABLES MAP", y + 10);

  doc.setFillColor(...C.light);
  doc.roundedRect(18, y, 174, 57, 4, 4, "F");

  doc.setDrawColor(...C.border);
  doc.rect(24, y + 6, 162, 45);

  doc.setFillColor(...C.blue);
  doc.circle(105, y + 28, 4, "F");

  doc.setTextColor(...C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Selected Property", 105, y + 39, {
    align: "center"
  });

  // Nearby markers
  [
    [65, 20],
    [145, 17],
    [135, 39],
    [78, 40],
    [158, 32],
  ].forEach(([x, yy]) => {
    doc.setFillColor(...C.grey);
    doc.circle(x, y + yy, 2.2, "F");
  });

  // Final valuation
  y = section("FINAL VALUATION SUMMARY", y + 70);

  doc.setFillColor(...C.navy);
  doc.roundedRect(18, y, 174, 29, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FINAL ESTIMATED PROPERTY VALUE", 25, y + 10);

  doc.setFontSize(16);
  doc.text(money(price), 25, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `Report generated on ${new Date().toLocaleDateString("en-IN")}`,
    W - 25, y + 16,
    { align: "right" }
  );

  // Disclaimer
  y += 40;

  doc.setTextColor(...C.blue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DISCLAIMER", 18, y);

  doc.setTextColor(...C.grey);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  doc.text(
    doc.splitTextToSize(
      "This report provides an estimated property valuation generated " +
      "from the submitted property details and available historical data. " +
      "It is intended for informational purposes only and does not " +
      "constitute a certified appraisal or guarantee of the actual sale price.",
      W - 36
    ),
    18,
    y + 7
  );

  doc.save("Real-Estate-Price-Predictor-Valuation-Report.pdf");
};

  const predictPrice = async () => {
    if (!formData.area || Number(formData.area) <= 0) {
  setError("Please enter a valid area greater than 0.");
  return;
}

if (Number(formData.bedroom_num) <= 0) {
  setError("Bedrooms must be at least 1.");
  return;
}

if (Number(formData.bathroom_num) <= 0) {
  setError("Bathrooms must be at least 1.");
  return;
}

if (Number(formData.balcony_num) < 0) {
  setError("Balconies cannot be negative.");
  return;
}

if (Number(formData.age) < 0) {
  setError("Property age cannot be negative.");
  return;
}

if (Number(formData.total_floors) <= 0) {
  setError("Total floors must be at least 1.");
  return;
}
  setLoading(true);
  setPrice(null);
  setNearbyProperties([]);
  setError("");

  try {
    console.log("LATITUDE:", formData.latitude);
console.log("LONGITUDE:", formData.longitude);
console.log("LAT TYPE:", typeof formData.latitude);
console.log("LON TYPE:", typeof formData.longitude);
    const response = await fetch("https://real-estate-price-predictor-api.onrender.com/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        area: Number(formData.area),
        bedroom_num: Number(formData.bedroom_num),
        bathroom_num: Number(formData.bathroom_num),
        balcony_num: Number(formData.balcony_num),
        age: Number(formData.age),
        total_floors: Number(formData.total_floors),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }),
    });

    const data = await response.json();

    console.log("BACKEND RESPONSE:", JSON.stringify(data, null, 2));
    console.log("PRICE:", data.predicted_price);
console.log("AREA:", formData.area);

  if (data.success) {
  setPrice(Number(data.predicted_price));
  if (data.price_range) {
  setPriceRange(data.price_range);
}
  setLocationAnalysis({
    distance_to_city_center: data.distance_to_city_center,
    distance_to_nearest_transit: data.distance_to_nearest_transit,
  });
  try {
  const nearbyResponse = await fetch(
   "https://real-estate-price-predictor-api.onrender.com/nearby-properties",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }),
    }
  );

  const nearbyData = await nearbyResponse.json();

  if (nearbyData.success) {
    setNearbyProperties(nearbyData.properties || []);
  }
} catch (nearbyError) {
  console.error("Nearby properties error:", nearbyError);
}

  setFeatureImportance(data.feature_importance || []);

  setHistory((prev) => [
  {
     id: Date.now(),
    locality: formData.locality,
    city: formData.city,
    area: formData.area,
    bedrooms: formData.bedroom_num,
    propertyType: formData.property_type,
    furnished: formData.furnished,
    bathrooms: formData.bathroom_num,
balconies: formData.balcony_num,
age: formData.age,
totalFloors: formData.total_floors,
latitude: formData.latitude,
longitude: formData.longitude,
    price: Number(data.predicted_price),
    date: new Date().toLocaleString("en-IN"),
  },
  ...prev,
]);
    } else {
      setError(data.error || "Prediction failed");
    }

  } catch (err) {
    console.error("ERROR:", err);
    setError("Backend server se connection nahi ho pa raha.");
  }

  setLoading(false);
};
if (authMode === "signup") {
  return <Signup onLogin={() => setAuthMode("login")} />;
}

if (authMode === "login") {
  return (
    <Login
      onLogin={() => {
        setAuthMode("app");
      }}
      onSignup={() => {
        console.log("CHANGING TO SIGNUP");
        setAuthMode("signup");
      }}
    />
  );
}

  return (
    <div className="container">
     <header className="hero-header">
  <div className="hero-icon">🏠</div>

  <div className="hero-content">
    <h1>Mumbai Real Estate Price Predictor</h1>

    <p className="subtitle">
      Predict property prices using Machine Learning
    </p>

    <div className="header-line"></div>
  </div>

  <button
    type="button"
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
</header>
  

<div className="map-container">
  <div className="location-search">

  <input
    type="text"
    value={locationSearch}
    onChange={(e) => setLocationSearch(e.target.value)}
    placeholder="🔍 Search locality in Mumbai"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        searchLocation();
      }
    }}
  />

  <button
    type="button"
    onClick={searchLocation}
  >
    Search
  </button>

</div>
  <button
  type="button"
  onClick={() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        }));
      },
      () => {
        alert("Location permission allow karo.");
      }
    );
  }}
>
  📍 Use My Location
</button>
<button
  type="button"
  className="heatmap-btn"
  onClick={() => setShowHeatmap((prev) => !prev)}
>
  {showHeatmap ? "Hide Price Heatmap" : "Show Price Heatmap"}
</button>
  <MapContainer
    center={[formData.latitude, formData.longitude]}
    zoom={12}
    style={{ height: "400px", width: "100%" }}
  >
    <TileLayer
  attribution='&copy OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
    
  <HeatmapLayer
  properties={heatmapProperties}
  showHeatmap={showHeatmap}
/>
<LocationSelector setFormData={setFormData} />

<MapCenter
  latitude={formData.latitude}
  longitude={formData.longitude}
/>

<Marker
  key={`${formData.latitude}-${formData.longitude}`}
  position={[formData.latitude, formData.longitude]}
>
      <Popup>
  <div className="map-popup">
    <strong>🏠 Selected Property</strong>

    <p>
      📍 {formData.locality}, {formData.city}
    </p>

    <p>
      🌐 Latitude: {formData.latitude}
    </p>

    <p>
      🌐 Longitude: {formData.longitude}
    </p>
  </div>
</Popup>
    </Marker>
    {/* Nearby Properties */}
{nearbyProperties.map((property, index) => (
  <Marker
    key={`${property.latitude}-${property.longitude}-${index}`}
    position={[
      property.latitude,
      property.longitude,
    ]}
  >
    <Popup>
      <div className="map-popup">
        <strong>🏠 Nearby Property</strong>

        <p>📍 {property.locality}</p>

        <p>
          💰 ₹{" "}
          {Number(property.price).toLocaleString("en-IN")}
        </p>

        <p>📐 {property.area} sqft</p>

        <p>🛏️ {property.bedrooms} BHK</p>

        <p>🏢 {property.property_type}</p>
      </div>
    </Popup>
  </Marker>
))}
  </MapContainer>
</div>

      <div className="form">

        <label>Area (sqft)</label>
        <input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="Example: 1000"
        />

        <label>Locality</label>
        <input
          type="text"
          name="locality"
          value={formData.locality}
          onChange={handleChange}
          placeholder="Example: Andheri"
        />

        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />

        <label>Property Type</label>
        <select
          name="property_type"
          value={formData.property_type}
          onChange={handleChange}
        >
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Independent House">Independent House</option>
          <option value="Studio">Studio</option>
          <option value="Penthouse">Penthouse</option>
        </select>

        <label>Bedrooms</label>
        <input
          type="number"
          name="bedroom_num"
          value={formData.bedroom_num}
          onChange={handleChange}
        />

        <label>Bathrooms</label>
        <input
          type="number"
          name="bathroom_num"
          value={formData.bathroom_num}
          onChange={handleChange}
        />

        <label>Balconies</label>
        <input
          type="number"
          name="balcony_num"
          value={formData.balcony_num}
          onChange={handleChange}
        />

        <label>Furnished</label>
        <select
          name="furnished"
          value={formData.furnished}
          onChange={handleChange}
        >
          <option value="Furnished">Furnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Unfurnished">Unfurnished</option>
        </select>

        <label>Property Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />

        <label>Total Floors</label>
        <input
          type="number"
          name="total_floors"
          value={formData.total_floors}
          onChange={handleChange}
        />

        
      <label>Latitude</label>
<input
  type="text"
  value={formData.latitude}
  readOnly
/>

<label>Longitude</label>
<input
  type="text"
  value={formData.longitude}
  readOnly
/>

        <button onClick={predictPrice} disabled={loading}>
          {loading ? "Predicting..." : "Predict Price"}
        </button>

      </div>

    { price !== null && (
  <div className="result">
    <h2>🏠 Estimated Property Price</h2>

  <h1 className="price-main">
  ₹ {Number(price).toLocaleString("en-IN")}
</h1>

<p className="price-format">
  ≈ ₹ {(Number(price) / 10000000).toFixed(2)} Crore
</p>

{featureImportance.length > 0 && (
  <div className="feature-importance">
    <h3>🔍 Top Important Features</h3>

    <p>
      Features that have the highest importance in the prediction model
    </p>

    <div className="feature-list">
      {featureImportance.map((item, index) => (
        <div className="feature-item" key={item.feature}>

          <div className="feature-header">
            <span>
              {index === 0 && "🥇 "}
              {index === 1 && "🥈 "}
              {index === 2 && "🥉 "}
              {item.feature.replace("_", " ")}
            </span>

            <strong>
              {(Number(item.importance) * 100).toFixed(1)}%
            </strong>
          </div>

          <div className="feature-bar">
            <div
              className="feature-bar-fill"
              style={{
                width: `${Number(item.importance) * 100}%`,
              }}
            ></div>
          </div>

        </div>
      ))}
    </div>
  </div>
)}
{priceRange && (
  <div className="price-range">
    <strong>📊 Estimated Price Range</strong>

    <p>
      ₹ {Number(priceRange.lower).toLocaleString("en-IN")}
      {" – "}
      ₹ {Number(priceRange.upper).toLocaleString("en-IN")}
    </p>
  </div>
)}
{/* PDF Report Button */}
{price && (
  <button
    type="button"
    className="download-pdf-btn"
    onClick={generatePDF}
  >
    📄 Download PDF Report
  </button>
)}

<p className="price-per-sqft"></p>
<p className="price-per-sqft">
  <strong>💰 Price per sqft:</strong>{" "}
  ₹{" "}
  {formData.area && Number(formData.area) > 0
    ? Math.round(price / Number(formData.area)).toLocaleString("en-IN")
    : "N/A"}
</p>
<div className="location-analysis">

  <h3>📍 Location Analysis</h3>

  <div className="location-analysis-grid">

    <div className="location-analysis-item">
      <span className="location-analysis-icon">📍</span>

      <div>
        <p>Distance to City Centre</p>

        <strong>
          {locationAnalysis.distance_to_city_center !== null
            ? `${Number(locationAnalysis.distance_to_city_center).toFixed(2)} km`
            : "N/A"}
        </strong>
      </div>
    </div>

    <div className="location-analysis-item">
      <span className="location-analysis-icon">🚉</span>

      <div>
        <p>Nearest Transit</p>

        <strong>
          {locationAnalysis.distance_to_nearest_transit !== null
            ? `${Number(locationAnalysis.distance_to_nearest_transit).toFixed(2)} km`
            : "N/A"}
        </strong>
      </div>
    </div>

  </div>

</div>

<div className="model-info">
  <div>
    <span>🤖 Model Used</span>
    <strong>Random Forest</strong>
  </div>

  <div>
    <span>🎯 R² Score</span>
    <strong>88.63%</strong>
  </div>
</div>
<button
  className="new-prediction-btn"
  onClick={resetPrediction}
>
  🔄 New Prediction
</button>

    <div className="property-summary">
     <div className="property-summary">

  <div className="summary-item">
    <span>📍 Location</span>
    <strong>
      {formData.locality}, {formData.city}
    </strong>
  </div>

  <div className="summary-item">
    <span>📐 Area</span>
    <strong>
      {formData.area} sqft
    </strong>
  </div>

  <div className="summary-item">
    <span>🛏 Bedrooms</span>
    <strong>
      {formData.bedroom_num} BHK
    </strong>
  </div>

  <div className="summary-item">
    <span>🚿 Bathrooms</span>
    <strong>
      {formData.bathroom_num}
    </strong>
  </div>

  <div className="summary-item">
    <span>🏢 Property Type</span>
    <strong>
      {formData.property_type}
    </strong>
  </div>

  <div className="summary-item">
    <span>🪑 Furnishing</span>
    <strong>
      {formData.furnished}
    </strong>
  </div>

</div>
    </div>
  </div>
)}

      {error && (
        <div className="error">
          {error}
        </div>
      )}
     
{history.length > 0 && (
  <div className="stats-container">

    <div className="stat-card">
      <span>📊</span>
      <div>
        <small>Total Predictions</small>
        <h3>{history.length}</h3>
      </div>
    </div>

    <div className="stat-card">
      <span>💰</span>
      <div>
        <small>Average Price</small>
        <h3>
          ₹{" "}
          {Math.round(
            history.reduce(
              (total, item) => total + Number(item.price),
              0
            ) / history.length
          ).toLocaleString("en-IN")}
        </h3>
      </div>
    </div>

    <div className="stat-card">
      <span>🏆</span>
      <div>
        <small>Highest Price</small>
        <h3>
          ₹{" "}
          {Math.max(
            ...history.map((item) => Number(item.price))
          ).toLocaleString("en-IN")}
        </h3>
      </div>
    </div>
    <div className="stat-card">
  <span>📉</span>

  <div>
    <small>Lowest Price</small>

    <h3>
      ₹{" "}
      {Math.min(
        ...history.map((item) => Number(item.price))
      ).toLocaleString("en-IN")}
    </h3>
  </div>
</div>
  </div>
)}

{history.length > 1 && (
  <div className="chart-section">

    <h2>📈 Price Prediction Analytics</h2>

    <p>Comparison of your previous property predictions</p>

    <div className="chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={[...history].reverse()}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="locality"
          />

          <YAxis />

          <Tooltip
            formatter={(value) =>
              `₹ ${Number(value).toLocaleString("en-IN")}`
            }
          />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 5 }}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>

  </div>
)}

{history.length > 0 && (
  <div className="history">

    <div className="history-header">
      <div className="history-search">
  <input
    type="text"
    placeholder="🔍 Search locality..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
      <div>
        <h2>📋 Prediction History</h2>
        <p>Your recent property price predictions</p>
      </div>

      <button
        className="clear-history"
        onClick={() => setHistory([])}
      >
        Clear All
      </button>
    </div>

    <div className="history-list">

      {filteredHistory.map((item, index) => (

        <div className="history-card" key={item.id}>

          <div className="history-top">

            <div>
              <h3>
                📍 {item.locality}, {item.city}
              </h3>
              <small className="history-date">
  🕒 {item.date}
</small>

              <span>
                {item.propertyType}
              </span>

            

            </div>

           
            <div className="history-price">
  ₹ {Number(item.price).toLocaleString("en-IN")}
</div>
<div className="history-price-per-sqft">
  ₹{" "}
  {item.area && Number(item.area) > 0
    ? Math.round(item.price / Number(item.area)).toLocaleString("en-IN")
    : "N/A"}{" "}
  / sqft
</div>
<button
  className="view-history"
  onClick={() => setSelectedHistory(item)}
>
  👁 View Details
</button>
<button
  className="delete-history"
  onClick={() => {
    setHistory((prev) =>
      prev.filter((historyItem) => historyItem.id !== item.id)
    );
  }}
>
  🗑 Delete
</button>

          </div>

          <div className="history-details">

            <div>
              <small>Area</small>
              <strong>📐 {item.area} sqft</strong>
            </div>

            <div>
              <small>Bedrooms</small>
              <strong>🛏 {item.bedrooms} BHK</strong>
            </div>

            <div>
              <small>Furnishing</small>
              <strong>🪑 {item.furnished}</strong>
            </div>

          </div>

          <div className="history-footer">

            <span>
              💰 ₹{" "}
              {item.area && Number(item.area) > 0
                ? Math.round(
                    item.price / Number(item.area)
                  ).toLocaleString("en-IN")
                : "N/A"}{" "}
              / sqft
            </span>

            

          </div>

        </div>

      ))}

       </div>
    </div>
  )}

  {/* View Details Modal */}
  {selectedHistory && (
    <div
      className="history-modal-overlay"
      onClick={() => setSelectedHistory(null)}
    >
      <div
        className="history-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={() => setSelectedHistory(null)}
        >
          ✕
        </button>

        <h2>🏠 Prediction Details</h2>

        <div className="modal-details">
          <div>
            <strong>📍 Locality</strong>
            <span>{selectedHistory.locality}</span>
          </div>

          <div>
            <strong>🏙️ City</strong>
            <span>{selectedHistory.city}</span>
          </div>

          <div>
            <strong>📐 Area</strong>
            <span>{selectedHistory.area} sqft</span>
          </div>

          <div>
            <strong>🛏️ Bedrooms</strong>
            <span>{selectedHistory.bedrooms} BHK</span>
          </div>

          <div>
            <strong>🚿 Bathrooms</strong>
            <span>{selectedHistory.bathrooms}</span>
          </div>

          <div>
            <strong>🌿 Balconies</strong>
            <span>{selectedHistory.balconies}</span>
          </div>

          <div>
            <strong>🏠 Property Type</strong>
            <span>{selectedHistory.propertyType}</span>
          </div>

          <div>
            <strong>🛋️ Furnishing</strong>
            <span>{selectedHistory.furnished}</span>
          </div>

          <div>
            <strong>📅 Property Age</strong>
            <span>{selectedHistory.age} years</span>
          </div>

          <div>
            <strong>🏢 Total Floors</strong>
            <span>{selectedHistory.totalFloors}</span>
          </div>

          <div>
            <strong>🌐 Latitude</strong>
            <span>{selectedHistory.latitude}</span>
          </div>

          <div>
            <strong>🌐 Longitude</strong>
            <span>{selectedHistory.longitude}</span>
          </div>
        </div>

        <div className="modal-price">
          <small>Estimated Property Price</small>
          <h3>
            ₹ {Number(selectedHistory.price).toLocaleString("en-IN")}
          </h3>
        </div>

        <p className="modal-date">
          Prediction: {selectedHistory.date}
        </p>
      </div>
    </div>
  )}

    </div>
  );
}



export default App;