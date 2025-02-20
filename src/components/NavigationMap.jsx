// src/components/NavigationMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaCompass } from "react-icons/fa";

// Fix default Leaflet icon paths (if needed)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Provide default metrics if none are passed in.
const defaultMetrics = {
  coordinates: { lat: 0, lng: 0 },
  eta: "N/A",
  timeRemaining: "N/A",
  batteryRange: "N/A",
};

const NavigationMap = ({ heading, metrics = defaultMetrics }) => {
  // Define center coordinates and zoom level for the map
  const center = [51.505, -0.09]; // Example coordinates; adjust as needed
  const zoom = 10;

  return (
    <div className="navigation-map-container">
      {/* Left Column: Compass and Metrics */}
      <div className="navigation-map-left">
        {/* Top Half: Compass */}
        <div className="navigation-compass">
          <div style={{ transform: `rotate(${heading}deg)` }}>
            <FaCompass size={100} color="#fff" />
          </div>
        </div>
        {/* Bottom Half: Metrics Grid */}
        <div className="navigation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label"><strong>Coordinates:</strong></span>
              <span className="metric-value">
                {metrics.coordinates.lat.toFixed(4)}, {metrics.coordinates.lng.toFixed(4)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>ETA:</strong></span>
              <span className="metric-value">{metrics.eta}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Time Remaining:</strong></span>
              <span className="metric-value">{metrics.timeRemaining}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Battery Range:</strong></span>
              <span className="metric-value">{metrics.batteryRange}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right Column: Map */}
      <div className="navigation-map-leaflet">
        <MapContainer center={center} zoom={zoom} style={{ width: "100%", height: "100%" }}>
          {/* Base Layer: OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Overlay: OpenSeaMap */}
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>You are here!</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;
