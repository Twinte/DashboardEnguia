// src/components/NavigationMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polyline, LayersControl, Tooltip } from "react-leaflet";
import L from 'leaflet'; // Needed for custom divIcon
import "leaflet/dist/leaflet.css";

import { FaTrash, FaCrosshairs } from "react-icons/fa";
import RecenterMap from "./RecenterMap";
import BoatMarker from "./BoatMarker";
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext";
import RoutingMachine from "./RoutingMachine";
import "./NavigationMap.css";

// Helper to format lat/lng
const formatCoord = (val) => val ? val.toFixed(4) : '';

function MapClickHandler({ onClick, isTripActive }) {
  const map = useMapEvent("click", (e) => {
    if (!isTripActive) {
      onClick(e);
    }
  });
  useEffect(() => {
    const mapContainer = map.getContainer();
    mapContainer.style.cursor = isTripActive ? "not-allowed" : "crosshair";
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
    distanceToNextWaypoint,
    courseToSteer
  } = useTrip();

  const [mapZoom] = useState(13);
  const [totalDistance, setTotalDistance] = useState(0); 
  const [eta, setEta] = useState(0); 

  const handleSetRouteSummary = (summary) => {
    if (summary) {
      setTotalDistance(summary.totalDistance); 
      setEta(summary.totalTime); 
    } else {
      setTotalDistance(0);
      setEta(0);
    }
  };

  useEffect(() => {
    if (!isTripActive || totalDistance === 0) return;
    const remainingDistanceKm = Math.max(0, totalDistance - distanceTraveled);
    const currentSpeed = parseFloat(speedKPH);
    const timeInHours = currentSpeed > 1 ? remainingDistanceKm / currentSpeed : (remainingDistanceKm / 20);
    setEta(timeInHours);
  }, [isTripActive, totalDistance, distanceTraveled, speedKPH]);

  const handleMapClick = async (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    await addWaypoint(newWaypoint);
  };

  const batteryConsumption = totalDistance * 0.5; 
  const isRoutePossible = batteryPercentage - batteryConsumption >= 0;

  // Prepare points for the planned route line
  // Start from boat position -> WP1 -> WP2...
  const plannedRouteLine = [
    [lat, lng],
    ...waypoints.map(wp => [wp.lat, wp.lng])
  ];

  return (
    <div className="navigation-map-container">
      
      {/* LEFT HUD PANEL (Floating) */}
      <div className="navigation-map-left">
        <div className="card-header">
          {isTripActive ? "MISSION ACTIVE" : "ROUTE PLANNER"}
        </div>

        <div className="waypoints-list">
          {waypoints.length === 0 && (
            <div className="empty-message">
              <FaCrosshairs size={30} style={{marginBottom:'1rem'}}/>
              <br/>TAP MAP TO SET COORDINATES
            </div>
          )}
          {waypoints.map((wp, index) => (
            <div key={wp.id} className="waypoint-item">
              <div style={{display:'flex', flexDirection:'column'}}>
                <span style={{fontSize:'0.7rem', opacity:0.7}}>WAYPOINT {index + 1}</span>
                <span className="coord-text">
                  {formatCoord(wp.lat)}, {formatCoord(wp.lng)}
                </span>
              </div>
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
            <button onClick={endTrip} className="btn btn-danger" style={{width: '100%'}}>
              ABORT MISSION
            </button>
          ) : (
            <>
              <button
                onClick={startTrip}
                className="btn btn-primary"
                disabled={waypoints.length === 0 || mqttConnectionStatus === "connecting"}
              >
                {mqttConnectionStatus === "connecting" ? "SYNC..." : "ENGAGE"}
              </button>
              <button
                onClick={() => {
                  clearRoute();
                  setTotalDistance(0);
                  setEta(0);
                }}
                className="btn btn-danger"
                disabled={waypoints.length === 0}
              >
                CLEAR
              </button>
            </>
          )}
        </div>

        {/* METRICS */}
        <div className="navigation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">TOTAL DIST</span>
              <span className="metric-value">{totalDistance.toFixed(2)} <small>KM</small></span>
            </div>
            <div className="metric-item">
              <span className="metric-label">EST. TIME</span>
              <span className="metric-value">
                {eta > 0 ? (eta * 60).toFixed(0) : "--"} <small>MIN</small>
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">FEASIBLE</span>
              <span className={`metric-value ${isRoutePossible ? "possible" : "impossible"}`}>
                {isRoutePossible ? "YES" : "NO"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">HEADING</span>
              <span className="metric-value">
                {isTripActive ? courseToSteer.toFixed(0) : heading}°
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MAP */}
      <div className="navigation-map-leaflet">
        <MapContainer center={[lat, lng]} zoom={mapZoom} style={{ width: "100%", height: "100%" }} zoomControl={false}>
          <MapClickHandler onClick={handleMapClick} isTripActive={isTripActive} />
          {isTripActive && <RecenterMap lat={lat} lng={lng} />}

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Tactical">
              <TileLayer
                attribution='&copy; OSM'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Boat */}
          <BoatMarker position={[lat, lng]} heading={heading} />

          {/* 1. ACTIVE TRIP PATH (Green Solid) */}
          {isTripActive && (
            <Polyline positions={traveledPath} color="#2ECC71" weight={4} opacity={0.8} />
          )}

          {/* 2. PLANNED ROUTE LINES (Blue Dashed) - Always show if waypoints exist */}
          {waypoints.length > 0 && (
             <Polyline 
               positions={plannedRouteLine} 
               color="#00A3FF" 
               weight={3} 
               dashArray="10, 10" 
               opacity={0.6} 
             />
          )}

          {/* 3. ROUTING MACHINE (Invisible calculation) */}
          {!isTripActive && waypoints.length > 0 && (
            <RoutingMachine start={[lat, lng]} waypoints={waypoints} setRouteSummary={handleSetRouteSummary} />
          )}

          {/* 4. WAYPOINT MARKERS (Custom Div Icons for text) */}
          {!isTripActive && waypoints.map((wp, index) => {
             // Create a custom icon displaying the coordinate numbers
             const textIcon = L.divIcon({
               className: 'custom-wp-icon',
               html: `<div class="waypoint-marker-icon">
                        ${formatCoord(wp.lat)}, ${formatCoord(wp.lng)}
                      </div>`,
               iconSize: [100, 20],
               iconAnchor: [50, 30] // Offset so it appears above point
             });

             return (
               <Marker key={wp.id} position={[wp.lat, wp.lng]} icon={textIcon}>
               </Marker>
             )
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;