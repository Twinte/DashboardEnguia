// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { FaCompass, FaCaretUp, FaTrash } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import RoutingMachine from "./RoutingMachine";
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext"; // 1. Importar o hook do TripContext
import './NavigationMap.css';

function MapClickHandler({ onClick, isTripActive }) {
  const map = useMapEvent("click", (e) => {
    if (!isTripActive) { // Só permite cliques se a viagem não estiver ativa
      onClick(e);
    }
  });

  // Muda o cursor do mapa com base no estado da viagem
  useEffect(() => {
    const mapContainer = map.getContainer();
    if (isTripActive) {
      mapContainer.style.cursor = 'not-allowed';
    } else {
      mapContainer.style.cursor = '';
    }
  }, [map, isTripActive]);
  
  return null;
}

const NavigationMap = () => {
  const { sensorData } = useSensorData();
  const { heading, lat, lng, batteryPercentage } = sensorData;
  
  // 2. Consumir tudo relacionado à rota do TripContext
  const {
    waypoints,
    isTripActive,
    addWaypoint,
    removeWaypoint,
    clearRoute,
    startTrip,
    endTrip
  } = useTrip();

  const [mapZoom] = useState(12);
  const [routeSummary, setRouteSummary] = useState(null);
  const [eta, setEta] = useState(0);
  const [batteryConsumption, setBatteryConsumption] = useState(0);
  const [isRoutePossible, setIsRoutePossible] = useState(true);

  const handleRouteFound = (summary) => {
    setRouteSummary(summary);
  };
  
  useEffect(() => {
    if (!routeSummary) {
      setEta(0);
      setBatteryConsumption(0);
      setIsRoutePossible(true);
      return;
    }
    const distanceInKm = routeSummary.totalDistance / 1000;
    const timeInHours = routeSummary.totalTime / 3600;
    const consumption = distanceInKm * 0.2;
    setEta(timeInHours);
    setBatteryConsumption(consumption);
    setIsRoutePossible(batteryPercentage - consumption >= 0);
  }, [routeSummary, batteryPercentage]);

  // 3. A lógica de clique agora vem do contexto
  const handleMapClick = (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    addWaypoint(newWaypoint);
  };

  const routePoints = [{ lat, lng }, ...waypoints];

  return (
    <div className="navigation-map-container">
      <div className="navigation-map-left">
        <div className="route-planner">
          {/* 4. A interface se adapta se a viagem estiver ativa */}
          <h4>{isTripActive ? "Viagem em Andamento" : "Planejador de Rota"}</h4>
          
          <div className="waypoints-list">
            {waypoints.length === 0 && <p className="empty-message">Clique no mapa para adicionar pontos.</p>}
            {waypoints.map((wp, index) => (
              <div key={wp.id} className="waypoint-item">
                <span>Ponto {index + 1}: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</span>
                {!isTripActive && (
                  <button onClick={() => removeWaypoint(wp.id)} className="remove-btn"><FaTrash /></button>
                )}
              </div>
            ))}
          </div>
          
          <div className="route-actions">
            {isTripActive ? (
              <button onClick={endTrip} className="action-btn clear-btn">Terminar Viagem</button>
            ) : (
              <>
                <button onClick={startTrip} className="action-btn start-btn" disabled={waypoints.length === 0}>Iniciar Viagem</button>
                <button onClick={() => { clearRoute(); setRouteSummary(null); }} className="action-btn clear-btn" disabled={waypoints.length === 0}>Limpar Rota</button>
              </>
            )}
          </div>
        </div>

        <div className="navigation-metrics">
           {/* ... (sem alterações aqui) ... */}
           <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label"><strong>Distância da Rota:</strong></span>
              <span className="metric-value">
                {routeSummary ? (routeSummary.totalDistance / 1000).toFixed(2) : '0.00'} km
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>ETA:</strong></span>
              <span className="metric-value">{(eta * 60).toFixed(0)} min</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Consumo Bateria:</strong></span>
              <span className="metric-value">{batteryConsumption.toFixed(1)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Rota Possível:</strong></span>
              <span className={`metric-value ${isRoutePossible ? 'possible' : 'impossible'}`}>{isRoutePossible ? "Sim" : "Não"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-map-leaflet">
        <MapContainer key={lat} center={[lat, lng]} zoom={mapZoom} style={{ width: "100%", height: "100%" }}>
          <MapClickHandler onClick={handleMapClick} isTripActive={isTripActive} />
          <RecenterMap lat={lat} lng={lng} />
          <TileLayer attribution='...' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]}><Popup>Você está aqui!</Popup></Marker>
          <RoutingMachine waypoints={routePoints} onRouteFound={handleRouteFound} />
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;