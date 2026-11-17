// src/components/NavigationMap.jsx
import { useEffect, useState, useMemo, memo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polyline, LayersControl } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

import { FaTrash, FaCrosshairs } from "react-icons/fa";
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import RecenterMap from "./RecenterMap";
import BoatMarker from "./BoatMarker";
import { useSensorData } from "../context/SensorDataContext";
import { useTrip } from "../context/TripContext";
import RoutingMachine from "./RoutingMachine";
import "./NavigationMap.css";

const formatCoord = (val) => val ? val.toFixed(4) : '';

const MapClickHandler = memo(function MapClickHandler({ onClick, isTripActive }) {
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
});

MapClickHandler.propTypes = {
  onClick: PropTypes.func.isRequired,
  isTripActive: PropTypes.bool.isRequired,
};

const NavigationMap = () => {
  const { t } = useTranslation();
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
    courseToSteer
  } = useTrip();

  const [mapZoom] = useState(13);
  const [totalDistance, setTotalDistance] = useState(0);
  const [eta, setEta] = useState(0);

  const handleSetRouteSummary = useCallback((summary) => {
    if (summary) {
      setTotalDistance(summary.totalDistance);
      setEta(summary.totalTime);
    } else {
      setTotalDistance(0);
      setEta(0);
    }
  }, []);

  useEffect(() => {
    if (!isTripActive || totalDistance === 0) return;
    const remainingDistanceKm = Math.max(0, totalDistance - distanceTraveled);
    const currentSpeed = parseFloat(speedKPH);
    const timeInHours = currentSpeed > 1 ? remainingDistanceKm / currentSpeed : (remainingDistanceKm / 20);
    setEta(timeInHours);
  }, [isTripActive, totalDistance, distanceTraveled, speedKPH]);

  const handleMapClick = useCallback(async (e) => {
    const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng, id: Date.now() };
    await addWaypoint(newWaypoint);
  }, [addWaypoint]);

  const isRoutePossible = useMemo(() => {
    const batteryConsumption = totalDistance * 0.5;
    return batteryPercentage - batteryConsumption >= 0;
  }, [totalDistance, batteryPercentage]);

  const plannedRouteLine = useMemo(() => [
    [lat, lng],
    ...waypoints.map(wp => [wp.lat, wp.lng])
  ], [lat, lng, waypoints]);

  return (
    <div className="navigation-map-container">

      <div className="navigation-map-left">
        <div className="card-header">
          {isTripActive ? t('mission_active') : t('route_planner')}
        </div>

        <div className="waypoints-list">
          {waypoints.length === 0 && (
            <div className="empty-message">
              <FaCrosshairs size={30} style={{marginBottom:'1rem'}}/>
              <br/>{t('tap_map_to_set')}
            </div>
          )}
          {waypoints.map((wp, index) => (
            <div key={wp.id} className="waypoint-item">
              <div style={{display:'flex', flexDirection:'column'}}>
                <span style={{fontSize:'0.7rem', opacity:0.7}}>{t('waypoint')} {index + 1}</span>
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
              {t('abort_mission')}
            </button>
          ) : (
            <>
              <button
                onClick={startTrip}
                className="btn btn-primary"
                disabled={waypoints.length === 0 || mqttConnectionStatus === "connecting"}
              >
                {mqttConnectionStatus === "connecting" ? t('sync') : t('engage')}
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
                {t('clear')}
              </button>
            </>
          )}
        </div>

        <div className="navigation-metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">{t('total_dist')}</span>
              <span className="metric-value">{totalDistance.toFixed(2)} <small>{t('km')}</small></span>
            </div>
            <div className="metric-item">
              <span className="metric-label">{t('est_time')}</span>
              <span className="metric-value">
                {eta > 0 ? (eta * 60).toFixed(0) : "--"} <small>{t('min')}</small>
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">{t('feasible')}</span>
              <span className={`metric-value ${isRoutePossible ? "possible" : "impossible"}`}>
                {isRoutePossible ? t('yes') : t('no')}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">{t('heading')}</span>
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

          {!isTripActive && waypoints.map((wp) => {
             const textIcon = L.divIcon({
               className: 'custom-wp-icon',
               html: `<div class="waypoint-marker-icon">
                        ${formatCoord(wp.lat)}, ${formatCoord(wp.lng)}
                      </div>`,
               iconSize: [100, 20],
               iconAnchor: [50, 30]
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
