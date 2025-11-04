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
  
  const [tripId, setTripId] = useState(null);

  const [distanceToNextWaypoint, setDistanceToNextWaypoint] = useState(0);
  const [courseToSteer, setCourseToSteer] = useState(0);

  const telemetryDataRef = useRef({});

  useEffect(() => {
    telemetryDataRef.current = {
      lat: sensorData.lat,
      lng: sensorData.lng,
      speedKPH: sensorData.speedKPH,
      heading: sensorData.heading,
      courseToSteer: courseToSteer,
      distanceToNextWaypoint: distanceToNextWaypoint,
      rpm: sensorData.rpm,
      batteryPercentage: sensorData.batteryPercentage,
      batteryVoltage: sensorData.batteryVoltage,
      temperature: sensorData.temp,
      windSpeed: sensorData.windSpeed,
      tripId: tripId,
      // NOVO: Adiciona a corrente ao ref
      currentDraw: sensorData.currentDraw
    };
  }, [sensorData, courseToSteer, distanceToNextWaypoint, tripId]);

  const publishTelemetry = useCallback(() => {
    const currentData = telemetryDataRef.current;
    
    const payload = {
      tripId: currentData.tripId,
      timestamp: new Date().toISOString(),
      coordinates: {
        lat: currentData.lat,
        lng: currentData.lng,
      },
      speedKPH: currentData.speedKPH,
      heading: currentData.heading,
      courseToSteer: currentData.courseToSteer,
      distanceToNextWaypoint: currentData.distanceToNextWaypoint,

      rpm: currentData.rpm,
      temperature: currentData.temperature,
      windSpeed: currentData.windSpeed,
      // NOVO: Adiciona a corrente ao payload
      currentDraw: currentData.currentDraw, 
      battery: {
        percentage: currentData.batteryPercentage,
        voltage: currentData.batteryVoltage
      }
    };
    
    publish(`boats/${BOAT_ID}/telemetry/live`, payload);
    console.log("Telemetry Published:", payload);
  }, [publish]); 


  const endTrip = useCallback(() => {
    const logPayload = {
      tripId: tripId,
      endTime: new Date().toISOString(),
      totalDistanceKm: distanceTraveled,
      traveledPath: traveledPath,
    };
    publish(`boats/${BOAT_ID}/trip/log`, logPayload);
    console.log("Trip Log Published:", logPayload);

    const statusPayload = {
      tripId: tripId,
      status: "completed",
      timestamp: new Date().toISOString()
    };
    publish(`boats/${BOAT_ID}/trip/status`, statusPayload);
    console.log("Trip Status 'Completed' Published:", statusPayload);


    setIsTripActive(false);
    setTripId(null);
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
    setTimeout(() => disconnect(), 1000); 
  }, [publish, distanceTraveled, traveledPath, disconnect, tripId]); 


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


  const startTrip = useCallback(() => {
    if (waypoints.length < 1) return;
    
    const newTripId = `trip-${Date.now()}`;
    setTripId(newTripId);
    
    connect(); 
    setTraveledPath([{ lat: sensorData.lat, lng: sensorData.lng, timestamp: new Date().toISOString() }]); 
    setDistanceTraveled(0);
    setIsTripActive(true);
    
    const payload = {
      tripId: newTripId,
      status: "started",
      timestamp: new Date().toISOString(),
      plannedRoute: waypoints
    };
    publish(`boats/${BOAT_ID}/trip/status`, payload);
    console.log("Trip Status 'Started' Published:", payload);

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


  const value = {
    waypoints, isTripActive, traveledPath, distanceTraveled, 
    addWaypoint: validateAndAddWaypoint,
    removeWaypoint, clearRoute, startTrip, endTrip,
    mqttConnectionStatus: connectionStatus,
    
    distanceToNextWaypoint,
    courseToSteer,
    tripId
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => useContext(TripContext);