// src/context/TripContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useSensorData } from './SensorDataContext';
import { useMQTT } from './MQTTContext'; // 1. Importar o hook do MQTT
import { getDistance } from '../utils/geolocation';

const TripContext = createContext();
const BOAT_ID = "barco-01"; // ID Único desta embarcação

export const TripProvider = ({ children }) => {
  const { sensorData } = useSensorData();
  const { connectionStatus, connect, disconnect, publish } = useMQTT(); // 2. Usar o contexto MQTT
  
  const [waypoints, setWaypoints] = useState([]);
  const [isTripActive, setIsTripActive] = useState(false);
  
  const [traveledPath, setTraveledPath] = useState([]);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  // Usamos useRef para o intervalo para evitar recriações
  const telemetryIntervalRef = useRef(null);

  useEffect(() => {
    // Se a viagem está ativa, mas a conexão MQTT cai, pare de enviar
    if (isTripActive && connectionStatus !== 'connected') {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
        telemetryIntervalRef.current = null;
      }
    }
    // Se a viagem está ativa e a conexão volta, reinicie o envio
    if (isTripActive && connectionStatus === 'connected' && !telemetryIntervalRef.current) {
      telemetryIntervalRef.current = setInterval(publishTelemetry, 5000); // Envia a cada 5 segundos
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
  
  // Rastreamento local da posição (sem alterações)
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
    connect(); // Inicia a conexão com o Broker
    setTraveledPath([{ lat: sensorData.lat, lng: sensorData.lng, timestamp: new Date().toISOString() }]);
    setDistanceTraveled(0);
    setIsTripActive(true);
    
    // Publica o status de início
    publish(`boats/${BOAT_ID}/trip/status`, {
      status: "started",
      timestamp: new Date().toISOString(),
      plannedRoute: waypoints
    });
  };

  const endTrip = () => {
    // Publica o log final completo
    publish(`boats/${BOAT_ID}/trip/log`, {
      endTime: new Date().toISOString(),
      totalDistanceKm: distanceTraveled,
      traveledPath: traveledPath,
    });
    // Publica o status de finalização
    publish(`boats/${BOAT_ID}/trip/status`, {
      status: "completed",
      timestamp: new Date().toISOString()
    });

    setIsTripActive(false);
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
    // Desconecta do broker após um pequeno delay para garantir o envio das últimas mensagens
    setTimeout(() => disconnect(), 1000);
  };
  
  // Funções de manipulação de waypoints (sem alterações, exceto pela limpeza)
  const addWaypoint = (newWaypoint) => !isTripActive && setWaypoints(p => [...p, newWaypoint]);
  const removeWaypoint = (id) => !isTripActive && setWaypoints(p => p.filter(wp => wp.id !== id));
  const clearRoute = () => {
    if (isTripActive) return;
    setWaypoints([]);
    setTraveledPath([]);
    setDistanceTraveled(0);
  };

  const value = {
    waypoints, isTripActive, traveledPath, distanceTraveled, addWaypoint,
    removeWaypoint, clearRoute, startTrip, endTrip,
    mqttConnectionStatus: connectionStatus,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => useContext(TripContext);