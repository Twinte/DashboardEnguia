// src/components/PowerPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaBolt, 
  FaTemperatureHigh, 
  FaRegClock, 
  FaChargingStation,
  FaHeartbeat,
  FaLayerGroup
} from 'react-icons/fa';
import { IoBarChart } from "react-icons/io5";
import { useSensorData } from '../context/SensorDataContext';
import { useSettings } from '../context/SettingsContext'; // Import Settings Context
import { renderSensorValue } from '../utils/formatters';
import './PowerPage.css';

const PowerPage = () => {
  const { t } = useTranslation();
  const { sensorData } = useSensorData();
  const { energyMode } = useSettings(); // Get current mode from settings

  const percentage = sensorData?.batteryPercentage || 0;
  const voltage = sensorData?.batteryVoltage || 0;
  const temperature = sensorData?.temp || 0;
  const currentDraw = sensorData?.currentDraw || 0;
  
  // Calculated or Static remaining time
  const timeRemaining = 5.2; 
  
  // Simulated State of Health (In a real app, this comes from the BMS)
  const stateOfHealth = "Good"; 

  // Determine colors based on status
  const getStatusColor = (val, type) => {
    if (type === 'temp') return val > 50 ? '#E74C3C' : '#00A3FF';
    if (type === 'batt') return val < 20 ? '#E74C3C' : '#2ECC71';
    return '#FFFFFF';
  };

  const batteryColor = getStatusColor(percentage, 'batt');

  return (
    <div className="power-container">
      
      {/* --- LEFT PANEL: ELECTRICAL & HEALTH --- */}
      <div className="power-side-panel left">
        
        {/* 1. Voltage */}
        <div className="hud-card">
          <FaBolt className="hud-card-icon" />
          <div className="hud-card-info">
            <span className="hud-label">{t('voltage')}</span>
            <div className="hud-value">
              {renderSensorValue(voltage, '', 1)}
              <span className="hud-unit">V</span>
            </div>
          </div>
        </div>

        {/* 2. Current Draw */}
        <div className="hud-card">
          <IoBarChart className="hud-card-icon" />
          <div className="hud-card-info">
            <span className="hud-label">{t('current_draw')}</span>
            <div className="hud-value">
              {renderSensorValue(currentDraw, '', 1)}
              <span className="hud-unit">A</span>
            </div>
          </div>
        </div>

        {/* 3. NEW: State of Health */}
        <div className="hud-card">
          <FaHeartbeat className="hud-card-icon" style={{ color: '#2ECC71' }} />
          <div className="hud-card-info">
            <span className="hud-label">State of Health</span>
            <div className="hud-value">
              {stateOfHealth}
            </div>
          </div>
        </div>

      </div>

      {/* --- CENTER: POWER CORE --- */}
      <div className="power-core-section">
        <div className="power-ring-container">
          <div className="reactor-ring" style={{ borderTopColor: batteryColor, boxShadow: `0 0 30px ${batteryColor}40` }}></div>
          <div className="reactor-ring-inner"></div>
          
          <div className="core-value">
            <FaChargingStation className="core-icon" style={{ color: batteryColor }}/>
            <span className="core-percentage" style={{ color: batteryColor, textShadow: `0 0 30px ${batteryColor}60` }}>
              {percentage}%
            </span>
            <span className="core-label">ENERGY</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: OPERATIONS & MODE --- */}
      <div className="power-side-panel right">
        
        {/* 1. Temperature */}
        <div className={`hud-card ${temperature > 50 ? 'danger' : ''}`}>
          <FaTemperatureHigh className="hud-card-icon" style={{ color: getStatusColor(temperature, 'temp') }}/>
          <div className="hud-card-info">
            <span className="hud-label">{t('temperature')}</span>
            <div className="hud-value">
              {renderSensorValue(temperature, '', 0)}
              <span className="hud-unit">°C</span>
            </div>
          </div>
        </div>

        {/* 2. Estimated Time */}
        <div className="hud-card">
          <FaRegClock className="hud-card-icon" />
          <div className="hud-card-info">
            <span className="hud-label">{t('estimated_time_remaining')}</span>
            <div className="hud-value">
              {renderSensorValue(timeRemaining, '', 1)}
              <span className="hud-unit">H</span>
            </div>
          </div>
        </div>

        {/* 3. NEW: Boat Mode */}
        <div className="hud-card">
          <FaLayerGroup className="hud-card-icon" style={{ color: 'var(--neon-orange)' }} />
          <div className="hud-card-info">
            <span className="hud-label">Boat Mode</span>
            <div className="hud-value" style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>
              {t(energyMode) || energyMode}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PowerPage;