// src/context/TripContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useSensorData } from './SensorDataContext';
import { useMQTT } from './MQTTContext'; 
import { getDistance, getBearing } from '../utils/geolocation';
import { useToast } from './ToastContext';

const TripContext = createContext();
const BOAT_ID = "barco-01"; 
const WAYPOINT_THRESHOLD_KM = 0.05; // 50 metros

export const TripProvider = ({ children }) => {
  const { sensorData } = useSensorData();
  const { connectionStatus, connect, disconnect, publish } = useMQTT(); 
  const { addToast } = useToast();
  
  const [waypoints, setWaypoints] = useState([]);
  const [isTripActive, setIsTripActive] = useState(false);
  const [traveledPath, setTraveledPath] = useState([]);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const telemetryIntervalRef = useRef(null);

  const [distanceToNextWaypoint, setDistanceToNextWaypoint] = useState(0);
  const [courseToSteer, setCourseToSteer] = useState(0);

  // --- INÍCIO DA CORREÇÃO ---
  // Criamos um 'ref' para guardar os dados mais recentes.
  // Refs podem ser atualizados à vontade sem causar re-renderizações.
  const telemetryDataRef = useRef({});

  // Atualizamos o 'ref' sempre que os dados dos sensores ou de navegação mudarem.
  useEffect(() => {
    telemetryDataRef.current = {
      lat: sensorData.lat,
      lng: sensorData.lng,
      speedKPH: sensorData.speedKPH,
      heading: sensorData.heading,
      courseToSteer: courseToSteer,
      distanceToNextWaypoint: distanceToNextWaypoint
    };
  }, [sensorData, courseToSteer, distanceToNextWaypoint]);

  // Agora, a função 'publishTelemetry' lê os dados do 'ref'.
  // A sua única dependência é a função 'publish' do MQTTContext,
  // que é estável e não muda.
  const publishTelemetry = useCallback(() => {
    // Lê os dados mais recentes de dentro do 'ref'
    const currentData = telemetryDataRef.current;
    
    const payload = {
      timestamp: new Date().toISOString(),
      coordinates: {
        lat: currentData.lat,
        lng: currentData.lng,
      },
      speedKPH: currentData.speedKPH,
      heading: currentData.heading,
      courseToSteer: currentData.courseToSteer,
      distanceToNextWaypoint: currentData.distanceToNextWaypoint
    };
    
    publish(`boats/${BOAT_ID}/telemetry/live`, payload);
    console.log("Telemetry Published:", payload);
  }, [publish]); // A função agora é estável

  // --- FIM DA CORREÇÃO ---


  const endTrip = useCallback(() => {
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
  }, [publish, distanceTraveled, traveledPath, disconnect]);


  // Este useEffect agora funciona corretamente, pois 'publishTelemetry' é estável.
  useEffect(() => {
    if (isTripActive && connectionStatus === 'connected') {
      if (!telemetryIntervalRef.current) {
        telemetryIntervalRef.current = setInterval(publishTelemetry, 5000);
      }
    } else {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
        telemetryIntervalRef.current = null;
      }
    }

    return () => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    };
  }, [isTripActive, connectionStatus, publishTelemetry]);

  
  // Efeito principal de navegação (cálculo e auto-avanço)
  useEffect(() => {
    if (!isTripActive || !sensorData.lat || !sensorData.lng) return;

    if (waypoints.length > 0) {
      const nextWaypoint = waypoints[0];
      
      const dist = getDistance(
        sensorData.lat, 
        sensorData.lng, 
        nextWaypoint.lat, 
        nextWaypoint.lng
      );
      setDistanceToNextWaypoint(dist); 

      const bearing = getBearing(
        sensorData.lat, 
        sensorData.lng, 
        nextWaypoint.lat, 
        nextWaypoint.lng
      );
      setCourseToSteer(bearing);

      if (dist < WAYPOINT_THRESHOLD_KM) {
        console.log(`Chegou ao waypoint: ${nextWaypoint.id}. A avançar...`);
        // Usamos o número de waypoints para saber qual ponto foi
        const pointNumber = (traveledPath[0]?.lat === waypoints[0].lat) ? 1 : (traveledPath.length > 0 ? traveledPath.length : 1);
        addToast(`A chegar ao Ponto ${pointNumber}. Próximo ponto.`, 'info');
        
        setWaypoints(prevWaypoints => prevWaypoints.slice(1));
      }
    
    } else if (isTripActive && waypoints.length === 0) {
      setDistanceToNextWaypoint(0);
      setCourseToSteer(sensorData.heading);

      addToast("Chegou ao destino final!", "success");
      endTrip();
    }

  }, [isTripActive, sensorData.lat, sensorData.lng, sensorData.heading, waypoints, addToast, endTrip, traveledPath]);

  
  // Efeito para adicionar a distância percorrida
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


  // Funções de controlo de rota
  const startTrip = useCallback(() => {
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
  }, [connect, publish, waypoints, sensorData.lat, sensorData.lng]);
  
  const addWaypointInternal = (newWaypoint) => {
    if (!isTripActive) {
      setWaypoints(p => [...p, newWaypoint]);
    }
  };

  const validateAndAddWaypoint = useCallback(async (newWaypoint) => {
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
  }, [isTripActive, addToast]);

  const removeWaypoint = useCallback((id) => {
    if (!isTripActive) {
      setWaypoints(p => p.filter(wp => wp.id !== id));
    }
  }, [isTripActive]);

  const clearRoute = useCallback(() => {
    if (isTripActive) return;
    setWaypoints([]);
    setTraveledPath([]);
    setDistanceTraveled(0);
  }, [isTripActive]);


  // Valor fornecido pelo Contexto
  const value = {
    waypoints, isTripActive, traveledPath, distanceTraveled, 
    addWaypoint: validateAndAddWaypoint,
    removeWaypoint, clearRoute, startTrip, endTrip,
    mqttConnectionStatus: connectionStatus,
    
    // ADICIONE ESTAS DUAS LINHAS
    distanceToNextWaypoint,
    courseToSteer
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => useContext(TripContext);