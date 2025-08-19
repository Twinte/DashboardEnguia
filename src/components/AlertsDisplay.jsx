// src/components/AlertsDisplay.jsx
import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './AlertsDisplay.css';

const AlertsDisplay = () => {
  const { alerts, removeAlert } = useAlerts();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="alerts-container">
      {alerts.map(alert => (
        <div key={alert.id} className={`alert-banner alert-${alert.type}`}>
          <FaExclamationTriangle className="alert-icon" />
          <span className="alert-message">{alert.message}</span>
          <button className="alert-dismiss-btn" onClick={() => removeAlert(alert.id)}>
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertsDisplay;