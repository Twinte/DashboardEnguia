// src/context/TripContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSensorData } from './SensorDataContext';
import { getDistance } from '../utils/geolocation';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const { sensorData } = useSensorData();
  
  const [waypoints, setWaypoints] = useState([]);
  const [isTripActive, setIsTripActive] = useState(false);
  
  // Novos estados para rastreamento
  const [traveledPath, setTraveledPath] = useState([]); // Array de coordenadas [lat, lng]
  const [distanceTraveled, setDistanceTraveled] = useState(0); // em km

  // Efeito que rastreia a posição do barco durante uma viagem
  useEffect(() => {
    if (isTripActive && sensorData.lat && sensorData.lng) {
      const newPoint = { lat: sensorData.lat, lng: sensorData.lng };
      
      setTraveledPath(prevPath => {
        // Evita adicionar pontos duplicados se o barco estiver parado
        const lastPoint = prevPath[prevPath.length - 1];
        if (lastPoint && lastPoint.lat === newPoint.lat && lastPoint.lng === newPoint.lng) {
          return prevPath;
        }
        
        // Calcula a nova distância total percorrida
        if (lastPoint) {
            const segmentDistance = getDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng);
            setDistanceTraveled(prevDist => prevDist + segmentDistance);
        }

        return [...prevPath, newPoint];
      });
    }
  }, [isTripActive, sensorData.lat, sensorData.lng]);

  const addWaypoint = (newWaypoint) => {
    if (isTripActive) return;
    setWaypoints(prev => [...prev, newWaypoint]);
  };

  const removeWaypoint = (idToRemove) => {
    if (isTripActive) return;
    setWaypoints(prev => prev.filter(wp => wp.id !== idToRemove));
  };
  
  const clearRoute = () => {
    if (isTripActive) return;
    setWaypoints([]);
    setTraveledPath([]);
    setDistanceTraveled(0);
  };

  const startTrip = () => {
    if (waypoints.length < 1) {
      alert("Por favor, adicione pelo menos um ponto à rota para iniciar.");
      return;
    }
    // "Congela" a rota e inicia o rastreamento a partir da posição atual
    setTraveledPath([{ lat: sensorData.lat, lng: sensorData.lng }]);
    setDistanceTraveled(0);
    setIsTripActive(true);
    console.log("Viagem iniciada com os waypoints:", waypoints);
  };

  const endTrip = () => {
    setIsTripActive(false);
    console.log("Viagem terminada. Distância percorrida:", distanceTraveled.toFixed(2), "km");
  };

  const value = {
    waypoints,
    isTripActive,
    traveledPath,
    distanceTraveled,
    addWaypoint,
    removeWaypoint,
    clearRoute,
    startTrip,
    endTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => {
  return useContext(TripContext);
};