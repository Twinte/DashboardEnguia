// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polyline, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { FaTrash } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import BoatMarker from "./BoatMarker";
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext";
import "./NavigationMap.css";

// NOVO: componente de roteamento que calcula rota e resumo (distância/tempo)
import RoutingMachine from "./RoutingMachine";

// Componente para capturar cliques no mapa e bloquear cliques durante a viagem
function MapClickHandler({ onClick, isTripActive }) {
  const map = useMapEvent("click", (e) => {
    if (!isTripActive) {
      onClick(e);
    }
  });

  useEffect(() => {
    const mapContainer = map.getContainer();
    mapContainer.style.cursor = isTripActive ? "not-allowed" : "";
  }, [map, isTripActive]);

  return null;
}

const NavigationMap = () => {
  const { sensorData } = useSensorData();
  const { heading, lat, lng, batteryPercentage, speedKPH } = sensorData;

  const {
    waypoints,
    isTripActive,
    traveledPath,
    distanceTraveled,
    addWaypoint,
    removeWaypoint,
    clearRoute,
    startTrip,
    endTrip,
    mqttConnectionStatus,
  } = useTrip();

  const [mapZoom] = useState(12);

  // Estes estados agora são atualizados pelo RoutingMachine
  const [totalDistance, setTotalDistance] = useState(0); // km
  const [eta, setEta] = useState(0); // horas (quando sem viagem = tempo total da rota)

  // O RoutingMachine chamará esta função com { totalDistance, totalTime }
  const handleSetRouteSummary = (summary) => {
    if (summary) {
      setTotalDistance(summary.totalDistance); // km
      setEta(summary.totalTime); // horas (tempo total estimado)
    } else {
      setTotalDistance(0);
      setEta(0);
    }
  };

  // Durante a viagem, recalcula o ETA restante com base na velocidade atual e distância restante.
  useEffect(() => {
    if (!isTripActive || totalDistance === 0) {
      // Sem viagem ativa: mantemos o ETA vindo do resumo da rota (totalTime)
      return;
    }

    const remainingDistanceKm = Math.max(0, totalDistance - distanceTraveled);
    const currentSpeed = parseFloat(speedKPH);
    const timeInHours = currentSpeed > 0 ? remainingDistanceKm / currentSpeed : Infinity;
    setEta(timeInHours);
  }, [isTripActive, totalDistance, distanceTraveled, speedKPH]);

  // Clique no mapa para adicionar waypoint (validação é feita via addWaypoint do TripContext)
  const handleMapClick = async (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    await addWaypoint(newWaypoint);
  };

  // Consumo simples estimado de bateria com base na distância total de rota
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
                {!isTripActive && (
                  <button onClick={() => removeWaypoint(wp.id)} className="btn-icon btn-danger">
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="route-actions">
            {isTripActive ? (
              <button onClick={endTrip} className="btn btn-danger">
                Terminar Viagem
              </button>
            ) : (
              <>
                <button
                  onClick={startTrip}
                  className="btn btn-primary"
                  disabled={waypoints.length === 0 || mqttConnectionStatus === "connecting"}
                >
                  {mqttConnectionStatus === "connecting" ? "Conectando..." : "Iniciar Viagem"}
                </button>
                <button
                  onClick={() => {
                    clearRoute();
                    setTotalDistance(0);
                    setEta(0);
                  }}
                  className="btn"
                  disabled={waypoints.length === 0}
                >
                  Limpar Rota
                </button>
              </>
            )}
          </div>
        </div>

        <div className="navigation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">
                <strong>Distância Total:</strong>
              </span>
              <span className="metric-value">{totalDistance.toFixed(2)} km</span>
            </div>

            <div className="metric-item">
              <span className="metric-label">
                <strong>Distância Restante:</strong>
              </span>
              <span className="metric-value">
                {isTripActive ? Math.max(0, totalDistance - distanceTraveled).toFixed(2) : "--"} km
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">
                <strong>ETA:</strong>
              </span>
              <span className="metric-value">{eta !== Infinity ? (eta * 60).toFixed(0) : "--"} min</span>
            </div>

            <div className="metric-item">
              <span className="metric-label">
                <strong>Rota Possível:</strong>
              </span>
              <span className={`metric-value ${isRoutePossible ? "possible" : "impossible"}`}>
                {isRoutePossible ? "Sim" : "Não"}
              </span>
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

          {/* Trajeto percorrido em verde durante a viagem */}
          {isTripActive && <Polyline positions={traveledPath} color="green" weight={5} />}

          {/* Roteamento preciso quando não está em viagem e há waypoints */}
          {!isTripActive && waypoints.length > 0 && (
            <RoutingMachine start={[lat, lng]} waypoints={waypoints} setRouteSummary={handleSetRouteSummary} />
          )}

          {/* (Opcional) Exibir marcadores dos waypoints quando não está em viagem */}
          {!isTripActive && waypoints.map((wp) => <Marker key={wp.id} position={[wp.lat, wp.lng]} />)}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;
