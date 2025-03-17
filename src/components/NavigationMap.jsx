// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaCompass } from "react-icons/fa";
import RecenterMap from "./RecenterMap";

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const defaultMetrics = {
  coordinates: { lat: 0, lng: 0 },
  eta: "N/A",
  timeRemaining: "N/A",
  batteryRange: "N/A",
};

const NavigationMap = ({ heading, metrics = defaultMetrics }) => {
  const [location, setLocation] = useState({
    lat: 51.505,  
    lng: -0.09,  
  });

  const [mapZoom] = useState(12);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location fetched:", position.coords);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }
  }, []);

  return (
    <div className="navigation-map-container">
      <div className="navigation-map-left">
        <div className="navigation-compass">
          <div style={{ transform: `rotate(${heading}deg)` }}>
            <FaCompass size={100} color="#fff" />
          </div>
        </div>
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

      <div className="navigation-map-leaflet">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={mapZoom}
          style={{ width: "100%", height: "100%" }}
        >
          <RecenterMap lat={location.lat} lng={location.lng} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here!</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;