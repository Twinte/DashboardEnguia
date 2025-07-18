// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { FaTrash } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import RoutingMachine from "./RoutingMachine";
import BoatMarker from "./BoatMarker"; // 1. Importar o novo marcador
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext";
import './NavigationMap.css';

function MapClickHandler({ onClick, isTripActive }) {
  const map = useMapEvent("click", (e) => {
    if (!isTripActive) onClick(e);
  });
  useEffect(() => {
    const mapContainer = map.getContainer();
    mapContainer.style.cursor = isTripActive ? 'not-allowed' : '';
  }, [map, isTripActive]);
  return null;
}

const NavigationMap = () => {
  const { sensorData } = useSensorData();
  const { heading, lat, lng, batteryPercentage, speedKPH } = sensorData;
  
  const {
    waypoints, isTripActive, traveledPath, distanceTraveled,
    addWaypoint, removeWaypoint, clearRoute, startTrip, endTrip
  } = useTrip();

  const [mapZoom] = useState(12);
  const [routeSummary, setRouteSummary] = useState(null);
  const [eta, setEta] = useState(0);

  const handleRouteFound = (summary) => setRouteSummary(summary);
  
  useEffect(() => {
    if (!routeSummary) {
      setEta(0);
      return;
    }
    const totalDistanceKm = routeSummary.totalDistance / 1000;
    const remainingDistanceKm = Math.max(0, totalDistanceKm - distanceTraveled);
    
    // Calcula ETA baseado na velocidade ATUAL e distância RESTANTE
    const currentSpeed = parseFloat(speedKPH);
    const timeInHours = currentSpeed > 0 ? remainingDistanceKm / currentSpeed : Infinity;
    setEta(timeInHours);
    
  }, [routeSummary, distanceTraveled, speedKPH]);

  const handleMapClick = (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    addWaypoint(newWaypoint);
  };

  const routePoints = [{ lat, lng }, ...waypoints];
  const totalDistanceKm = routeSummary ? routeSummary.totalDistance / 1000 : 0;
  const batteryConsumption = totalDistanceKm * 0.2;
  const isRoutePossible = batteryPercentage - batteryConsumption >= 0;

  return (
    <div className="navigation-map-container">
      <div className="navigation-map-left">
        <div className="route-planner">
          <h4>{isTripActive ? "Viagem em Andamento" : "Planejador de Rota"}</h4>
          <div className="waypoints-list">
            {waypoints.length === 0 && <p className="empty-message">Clique no mapa para adicionar pontos.</p>}
            {waypoints.map((wp, index) => (
              <div key={wp.id} className="waypoint-item">
                <span>Ponto {index + 1}</span>
                {!isTripActive && <button onClick={() => removeWaypoint(wp.id)} className="remove-btn"><FaTrash /></button>}
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
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label"><strong>Distância Total:</strong></span>
              <span className="metric-value">{totalDistanceKm.toFixed(2)} km</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Distância Restante:</strong></span>
              <span className="metric-value">
                {isTripActive ? Math.max(0, totalDistanceKm - distanceTraveled).toFixed(2) : '--'} km
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>ETA:</strong></span>
              <span className="metric-value">{isTripActive && eta !== Infinity ? (eta * 60).toFixed(0) : '--'} min</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Rota Possível:</strong></span>
              <span className={`metric-value ${isRoutePossible ? 'possible' : 'impossible'}`}>{isRoutePossible ? "Sim" : "Não"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-map-leaflet">
        <MapContainer key={`${lat}-${lng}`} center={[lat, lng]} zoom={mapZoom} style={{ width: "100%", height: "100%" }}>
          <MapClickHandler onClick={handleMapClick} isTripActive={isTripActive} />
          {isTripActive && <RecenterMap lat={lat} lng={lng} />}
          <TileLayer attribution='...' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* 2. Substituir o Marker padrão pelo nosso BoatMarker rotacionável */}
          <BoatMarker position={[lat, lng]} heading={heading} />

          {/* 3. Desenhar o caminho já percorrido se a viagem estiver ativa */}
          {isTripActive && <Polyline positions={traveledPath} color="green" weight={5} />}
          
          {/* A máquina de roteamento continua desenhando a rota planejada em azul */}
          {!isTripActive && waypoints.length > 0 && (
             <RoutingMachine waypoints={routePoints} onRouteFound={handleRouteFound} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;