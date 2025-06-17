// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaCompass, FaCaretUp } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import { useSensorData } from "../context/SensorDataContext";
import { getDistance } from '../utils/geolocation';

// Função para capturar o Clique direteamente no Mapa
function MapClickHandler({ onClick }) {
  useMapEvent("click", (e) => {
    onClick(e);
  });
  return null;
}

const NavigationMap = () => {
  const { sensorData } = useSensorData();
  const { heading, lat, lng, batteryPercentage } = sensorData;

  const [mapZoom] = useState(12);
  const [destination, setDestination] = useState(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [eta, setEta] = useState(0);
  const [batteryRange, setBatteryRange] = useState(0);
  const [isRoutePossible, setIsRoutePossible] = useState(true);

  const cruisingSpeed = 40;
  const batteryCapacity = batteryPercentage;

  const calculateRouteDetails = (distance) => {
    const time = distance / cruisingSpeed;
    const consumption = (distance * 0.2);
    const batteryLeft = batteryCapacity - consumption;

    setEta(time);
    setBatteryRange(consumption);
    setIsRoutePossible(batteryLeft >= 0);
  };
  
  // A função que lida com o clique
  const handleClick = (e) => {
    setDestination({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
  };

  useEffect(() => {
    if (destination) {
      const distance = getDistance(lat, lng, destination.lat, destination.lng);
      setRouteDistance(distance);
      calculateRouteDetails(distance);
    }
  }, [destination, lat, lng, batteryCapacity]);

  return (
    <div className="navigation-map-container">
      <div className="navigation-map-left">
        <div className="navigation-compass-container">
          <div className="lubber-line">
            <FaCaretUp size={24} color="var(--text-primary)" />
          </div>
          <div
            className="compass-rose"
            style={{ transform: `rotate(${(360 - heading) % 360}deg)` }}
          >
            <FaCompass size={100} color="var(--text-primary)" />
          </div>
          <div className="heading-value-display">
            {heading.toFixed(0)}°
          </div>
        </div>
        <div className="navigation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label"><strong>Coordinates:</strong></span>
              <span className="metric-value">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Route Distance:</strong></span>
              <span className="metric-value">{routeDistance.toFixed(2)} km</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>ETA:</strong></span>
              <span className="metric-value">{(eta * 60).toFixed(2)} minutes</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Battery Range:</strong></span>
              <span className="metric-value">{batteryRange.toFixed(2)}% battery</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Route Possible:</strong></span>
              <span className="metric-value">{isRoutePossible ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-map-leaflet">
        <MapContainer
          key={lat}
          center={[lat, lng]}
          zoom={mapZoom}
          style={{ width: "100%", height: "100%" }}
        >
          {/* AQUI ESTÁ A CORREÇÃO: Passando 'handleClick' em vez de 'onClick' */}
          <MapClickHandler onClick={handleClick} />
          <RecenterMap lat={lat} lng={lng} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>You are here!</Popup>
          </Marker>
          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setDestination({ lat: position.lat, lng: position.lng });
                },
              }}
            >
              <Popup>Drag me to change destination</Popup>
            </Marker>
          )}
          {destination && (
            <Polyline positions={[ [lat, lng], [destination.lat, destination.lng] ]} color="blue" />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;