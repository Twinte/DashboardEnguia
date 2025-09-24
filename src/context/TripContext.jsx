// src/context/TripContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useSensorData } from './SensorDataContext';
import { useMQTT } from './MQTTContext'; 
import { getDistance } from '../utils/geolocation';
import { useToast } from './ToastContext';

const TripContext = createContext();
const BOAT_ID = "barco-01"; 

export const TripProvider = ({ children }) => {
  const { sensorData } = useSensorData();
  // A variável 'connectionStatus' vem do useMQTT()
  const { connectionStatus, connect, disconnect, publish } = useMQTT(); 
  const { addToast } = useToast();
  
  const [waypoints, setWaypoints] = useState([]);
  const [isTripActive, setIsTripActive] = useState(false);
  const [traveledPath, setTraveledPath] = useState([]);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const telemetryIntervalRef = useRef(null);

  useEffect(() => {
    if (isTripActive && connectionStatus !== 'connected') {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
        telemetryIntervalRef.current = null;
      }
    }
    if (isTripActive && connectionStatus === 'connected' && !telemetryIntervalRef.current) {
      telemetryIntervalRef.current = setInterval(publishTelemetry, 5000);
    }
  }, [isTripActive, connectionStatus]);

  const publishTelemetry = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      coordinates: {
        lat: sensorData.lat,
        lng: sensorData.lng,
      },
      speedKPH: sensorData.speedKPH,
      heading: sensorData.heading
    };
    publish(`boats/${BOAT_ID}/telemetry/live`, payload);
    console.log("Telemetry Published:", payload);
  };
  
  useEffect(() => {
    if (isTripActive && sensorData.lat && sensorData.lng) {
      const newPoint = { lat: sensorData.lat, lng: sensorData.lng, timestamp: new Date().toISOString() };
      setTraveledPath(prevPath => {
        const lastPoint = prevPath[prevPath.length - 1];
        if (lastPoint && lastPoint.lat === newPoint.lat && lastPoint.lng === newPoint.lng) return prevPath;
        if (lastPoint) {
          const segmentDistance = getDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
          setDistanceTraveled(prevDist => prevDist + segmentDistance);
        }
        return [...prevPath, newPoint];
      });
    }
  }, [isTripActive, sensorData.lat, sensorData.lng]);

  const startTrip = () => {
    if (waypoints.length < 1) return;
    connect();
    setTraveledPath([{ lat: sensorData.lat, lng: sensorData.lng, timestamp: new Date().toISOString() }]);
    setDistanceTraveled(0);
    setIsTripActive(true);
    
    publish(`boats/${BOAT_ID}/trip/status`, {
      status: "started",
      timestamp: new Date().toISOString(),
      plannedRoute: waypoints
    });
  };

  const endTrip = () => {
    publish(`boats/${BOAT_ID}/trip/log`, {
      endTime: new Date().toISOString(),
      totalDistanceKm: distanceTraveled,
      traveledPath: traveledPath,
    });
    publish(`boats/${BOAT_ID}/trip/status`, {
      status: "completed",
      timestamp: new Date().toISOString()
    });

    setIsTripActive(false);
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
    setTimeout(() => disconnect(), 1000);
  };
  
  const addWaypointInternal = (newWaypoint) => {
    if (!isTripActive) {
      setWaypoints(p => [...p, newWaypoint]);
    }
  };

  const validateAndAddWaypoint = async (newWaypoint) => {
    if (isTripActive) return;

    try {
      const response = await fetch(`https://is-on-water.balbona.me/api/v1/get/${newWaypoint.lat}/${newWaypoint.lng}`);
      const data = await response.json();

      if (data.isWater) {
        addWaypointInternal(newWaypoint);
      } else {
        addToast("Não é possível adicionar um ponto em terra.", "error");
      }
    } catch (error) {
      console.error("Erro ao validar o ponto:", error);
      addToast("Não foi possível validar o ponto. Adicionado mesmo assim.", "info");
      addWaypointInternal(newWaypoint);
    }
  };

  const removeWaypoint = (id) => !isTripActive && setWaypoints(p => p.filter(wp => wp.id !== id));
  const clearRoute = () => {
    if (isTripActive) return;
    setWaypoints([]);
    setTraveledPath([]);
    setDistanceTraveled(0);
  };

  const value = {
    waypoints, isTripActive, traveledPath, distanceTraveled, 
    addWaypoint: validateAndAddWaypoint,
    removeWaypoint, clearRoute, startTrip, endTrip,
    // CORREÇÃO: Passar a variável 'connectionStatus' com o nome 'mqttConnectionStatus'
    mqttConnectionStatus: connectionStatus,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => useContext(TripContext);