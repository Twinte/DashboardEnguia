// src/context/TripContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Criar o contexto
const TripContext = createContext();

// Criar o Provedor
export const TripProvider = ({ children }) => {
  const [waypoints, setWaypoints] = useState([]);
  const [isTripActive, setIsTripActive] = useState(false);

  // Função para adicionar um novo waypoint
  const addWaypoint = (newWaypoint) => {
    if (isTripActive) return; // Não permite adicionar pontos durante uma viagem
    setWaypoints(prev => [...prev, newWaypoint]);
  };

  // Função para remover um waypoint
  const removeWaypoint = (idToRemove) => {
    if (isTripActive) return;
    setWaypoints(prev => prev.filter(wp => wp.id !== idToRemove));
  };
  
  // Função para limpar a rota
  const clearRoute = () => {
    if (isTripActive) return;
    setWaypoints([]);
  };

  // Função para iniciar a viagem
  const startTrip = () => {
    if (waypoints.length < 1) {
      alert("Por favor, adicione pelo menos um ponto à rota para iniciar.");
      return;
    }
    setIsTripActive(true);
    // No futuro, aqui podemos "congelar" a rota e iniciar o tracking
    console.log("Viagem iniciada com os waypoints:", waypoints);
  };

  // Função para terminar a viagem
  const endTrip = () => {
    setIsTripActive(false);
    console.log("Viagem terminada.");
  };

  // Valor a ser fornecido pelo contexto
  const value = {
    waypoints,
    isTripActive,
    addWaypoint,
    removeWaypoint,
    clearRoute,
    startTrip,
    endTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

// Hook personalizado para facilitar o uso do contexto
export const useTrip = () => {
  return useContext(TripContext);
};