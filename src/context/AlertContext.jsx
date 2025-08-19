// src/context/AlertContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Adiciona um alerta se ele ainda não existir
  const addAlert = useCallback((id, message, type = 'warning') => {
    setAlerts(prevAlerts => {
      if (prevAlerts.some(alert => alert.id === id)) {
        return prevAlerts; // Não adiciona duplicados
      }
      return [...prevAlerts, { id, message, type }];
    });
  }, []);

  // Remove um alerta específico
  const removeAlert = useCallback((id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  const value = { alerts, addAlert, removeAlert };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};