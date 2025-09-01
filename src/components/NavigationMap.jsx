// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polyline, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { FaTrash } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import BoatMarker from "./BoatMarker";
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext";
import { getDistance } from "../utils/geolocation";
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

  useEffect(() => {
    if (waypoints.length === 0) {
      setTotalDistance(0);
      return;
    }

    const points = [{ lat, lng }, ...waypoints];
    let calculatedDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      calculatedDistance += getDistance(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
    }
    setTotalDistance(calculatedDistance);
  }, [waypoints, lat, lng]);

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

  // ATUALIZAÇÃO: handleMapClick agora é uma função async
  const handleMapClick = async (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    // A função 'addWaypoint' que vem do useTrip() agora é a nossa nova função de validação
    await addWaypoint(newWaypoint);
  };

  const routePoints = [{ lat, lng }, ...waypoints];
  const batteryConsumption = totalDistance * 0.2;
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
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satélite">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Informações Náuticas (OpenSeaMap)">
              <TileLayer
                attribution='&copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              />
            </LayersControl.Overlay>
          </LayersControl>
          
          <BoatMarker position={[lat, lng]} heading={heading} />

          {isTripActive && <Polyline positions={traveledPath} color="green" weight={5} />}
          
          {!isTripActive && waypoints.length > 0 && (
            <>
              <Polyline positions={routePoints} color="#3388ff" weight={5} dashArray="10, 5" />
              {waypoints.map(wp => <Marker key={wp.id} position={[wp.lat, wp.lng]} />)}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;