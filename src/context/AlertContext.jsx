// src/context/AlertContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((id, message, type = 'warning') => {
    setAlerts(prevAlerts => {
      if (prevAlerts.some(alert => alert.id === id)) {
        return prevAlerts;
      }
      return [...prevAlerts, { id, message, type }];
    });
  }, []);

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

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
