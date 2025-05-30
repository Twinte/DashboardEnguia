// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useMapEvent } from "react-leaflet"; // Import para capturar eventos no Mapa
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaCompass, FaCaretUp } from "react-icons/fa";
import RecenterMap from "./RecenterMap";

// Função para capturar o Clique direteamente no Mapa
function MapClickHandler({ onClick }) {
  useMapEvent("click", (e) => {
    console.log("Clique detectado:", e.latlng);
    onClick(e);
  });
  return null;
}

// Função para calcular a distância entre duas coordenadas geográficas
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em km
  return distance;
};

const NavigationMap = ({ heading }) => {
  const [location, setLocation] = useState({
    lat: 51.505,  // Default latitude (London)
    lng: -0.09,   // Default longitude (London)
  });

  const [mapZoom] = useState(12);
  const [destination, setDestination] = useState(null);  // Destino do usuário
  const [routeDistance, setRouteDistance] = useState(0);  // Distância total da rota
  const [eta, setEta] = useState(0);  // Tempo estimado em horas
  const [batteryRange, setBatteryRange] = useState(0);  // Consumo de bateria estimado
  const [isRoutePossible, setIsRoutePossible] = useState(true);  // Verificar se a rota é possível

  const cruisingSpeed = 40;  // Velocidade máxima (km/h)
  const batteryCapacity = 100;  // Capacidade total da bateria (percentagem)

  // Função para calcular o tempo estimado e o consumo de bateria
  const calculateRouteDetails = (distance) => {
    const time = distance / cruisingSpeed; // Tempo estimado (em horas)
    const consumption = (distance * 0.2);  // Consumo de bateria estimado por km (ajustar conforme necessário)
    const batteryLeft = batteryCapacity - consumption; // Bateria restante após a viagem

    setEta(time);
    setBatteryRange(consumption);
    setIsRoutePossible(batteryLeft >= 0);  // Se a bateria for suficiente
  };

  // Hook de geolocalização para obter a localização atual
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

  // Função para lidar com o clique do usuário no mapa
  const handleClick = (e) => {
    setDestination({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
  };

  // Quando o destino mudar, calcular a distância e as métricas da rota
  useEffect(() => {
    if (destination) {
      const distance = getDistance(location.lat, location.lng, destination.lat, destination.lng);
      setRouteDistance(distance);
      calculateRouteDetails(distance);
    }
  }, [destination, location]);

  return (
    <div className="navigation-map-container">
      <div className="navigation-map-left">
        <div className="navigation-compass-container"> {/* Novo container para posicionamento */}
          <div className="lubber-line">
            <FaCaretUp size={24} color="var(--text-primary)" /> {/* Ou uma div estilizada */}
          </div>
          <div 
            className="compass-rose" 
            style={{ transform: `rotate(${(360 - heading) % 360}deg)` }}
          >
            <FaCompass size={100} color="var(--text-primary)" /> {/* Usar variável de cor */}
          </div>
          <div className="heading-value-display">
            {heading.toFixed(0)}°
          </div>
        </div>
        <div className="navigation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label"><strong>Coordinates:</strong></span>
              <span className="metric-value">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
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
          center={[location.lat, location.lng]}
          zoom={mapZoom}
          style={{ width: "100%", height: "100%" }}
          // whenCreated={map => map.on('click', handleClick)} // Adiciona o clique no mapa
        >
          //Lido diretamente com o evento de clique no mapa e posteriormente defino o destino
          <MapClickHandler onClick={handleClick} /> 
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
            <Polyline positions={[ [location.lat, location.lng], [destination.lat, destination.lng] ]} color="blue" />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;
