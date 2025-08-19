// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// O import do 'leaflet-routing-machine.css' já não é necessário

import { FaTrash } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import BoatMarker from "./BoatMarker";
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext";
import { getDistance } from "../utils/geolocation"; // Importar a nossa função de cálculo de distância
import './NavigationMap.css';

// Componente para capturar cliques no mapa (sem alterações)
function MapClickHandler({ onClick, isTripActive }) {
  const map = useMapEvent("click", (e) => {
    if (!isTripActive) {
      onClick(e);
    }
  });

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
  const { heading, lat, lng, batteryPercentage, speedKPH } = sensorData;
  
  const {
    waypoints, isTripActive, traveledPath, distanceTraveled,
    addWaypoint, removeWaypoint, clearRoute, startTrip, endTrip,
    mqttConnectionStatus
  } = useTrip();

  const [mapZoom] = useState(12);
  const [totalDistance, setTotalDistance] = useState(0);
  const [eta, setEta] = useState(0);

  // Efeito para calcular a distância total da rota planeada manualmente
  useEffect(() => {
    if (waypoints.length === 0) {
      setTotalDistance(0);
      return;
    }

    const points = [{ lat, lng }, ...waypoints];
    let calculatedDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      // Usa a nossa função getDistance para calcular a distância entre cada segmento
      calculatedDistance += getDistance(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
    }
    setTotalDistance(calculatedDistance);
  }, [waypoints, lat, lng]); // Recalcula sempre que os waypoints ou a posição inicial mudam

  // Efeito para calcular o ETA (sem alterações significativas)
  useEffect(() => {
    if (totalDistance === 0) {
      setEta(0);
      return;
    }
    const remainingDistanceKm = Math.max(0, totalDistance - distanceTraveled);
    const currentSpeed = parseFloat(speedKPH);
    const timeInHours = currentSpeed > 0 ? remainingDistanceKm / currentSpeed : Infinity;
    setEta(timeInHours);
    
  }, [totalDistance, distanceTraveled, speedKPH]);

  const handleMapClick = (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    addWaypoint(newWaypoint);
  };

  const routePoints = [{ lat, lng }, ...waypoints];
  const batteryConsumption = totalDistance * 0.2; // Exemplo: 0.2 kWh por km
  const isRoutePossible = batteryPercentage - batteryConsumption >= 0;

  return (
    <div className="navigation-map-container">
      <div className="navigation-map-left">
        <div className="route-planner card">
          <h4 className="card-header">{isTripActive ? "Viagem em Andamento" : "Planejador de Rota"}</h4>
          
          <div className="waypoints-list">
            {waypoints.length === 0 && <p className="empty-message">Clique no mapa para adicionar pontos.</p>}
            {waypoints.map((wp, index) => (
              <div key={wp.id} className="waypoint-item">
                <span>Ponto {index + 1}</span>
                {!isTripActive && <button onClick={() => removeWaypoint(wp.id)} className="btn-icon btn-danger"><FaTrash /></button>}
              </div>
            ))}
          </div>
          
          <div className="route-actions">
            {isTripActive ? (
              <button onClick={endTrip} className="btn btn-danger">Terminar Viagem</button>
            ) : (
              <>
                <button 
                  onClick={startTrip} 
                  className="btn btn-primary" 
                  disabled={waypoints.length === 0 || mqttConnectionStatus === 'connecting'}
                >
                  {mqttConnectionStatus === 'connecting' ? 'Conectando...' : 'Iniciar Viagem'}
                </button>
                <button onClick={() => { clearRoute(); setTotalDistance(0); }} className="btn" disabled={waypoints.length === 0}>Limpar Rota</button>
              </>
            )}
          </div>
        </div>

        <div className="navigation-metrics">
           <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label"><strong>Distância Total:</strong></span>
              <span className="metric-value">{totalDistance.toFixed(2)} km</span>
            </div>
            <div className="metric-item">
              <span className="metric-label"><strong>Distância Restante:</strong></span>
              <span className="metric-value">
                {isTripActive ? Math.max(0, totalDistance - distanceTraveled).toFixed(2) : '--'} km
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
        <MapContainer center={[lat, lng]} zoom={mapZoom} style={{ width: "100%", height: "100%" }}>
          <MapClickHandler onClick={handleMapClick} isTripActive={isTripActive} />
          {isTripActive && <RecenterMap lat={lat} lng={lng} />}
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <BoatMarker position={[lat, lng]} heading={heading} />

          {/* Rota percorrida (linha verde contínua) */}
          {isTripActive && <Polyline positions={traveledPath} color="green" weight={5} />}
          
          {/* Rota planeada (linha azul tracejada) */}
          {!isTripActive && waypoints.length > 0 && (
            <>
              {/* Desenha a linha de rota */}
              <Polyline positions={routePoints} color="#3388ff" weight={5} dashArray="10, 5" />
              {/* Desenha um marcador para cada waypoint */}
              {waypoints.map(wp => <Marker key={wp.id} position={[wp.lat, wp.lng]} />)}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;