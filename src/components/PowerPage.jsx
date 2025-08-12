// src/components/PowerPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
// 1. Importar todos os ícones de bateria necessários e o relógio
import { 
  FaBatteryFull, 
  FaBatteryThreeQuarters, 
  FaBatteryHalf, 
  FaBatteryQuarter, 
  FaBatteryEmpty, 
  FaBolt, 
  FaTemperatureHigh, 
  FaRegClock 
} from 'react-icons/fa';
import { IoBarChart } from "react-icons/io5";
import { useSensorData } from '../context/SensorDataContext';
import { renderSensorValue } from '../utils/formatters';
import './PowerPage.css';

const PowerPage = () => {
  const { t } = useTranslation();
  const { sensorData } = useSensorData();

  const percentage = sensorData?.batteryPercentage || 0;
  const voltage = sensorData?.batteryVoltage || 0;
  const temperature = sensorData?.temp || 0;
  const currentDraw = 15.5; // Valor de exemplo
  const timeRemaining = 5.2; // Valor de exemplo em horas

  // 2. Lógica para escolher o ícone e a cor da bateria
  const getBatteryStyle = () => {
    if (percentage > 85) return { icon: <FaBatteryFull />, color: '#2ECC71' };
    if (percentage > 60) return { icon: <FaBatteryThreeQuarters />, color: '#2ECC71' };
    if (percentage > 35) return { icon: <FaBatteryHalf />, color: '#F1C40F' };
    if (percentage > 10) return { icon: <FaBatteryQuarter />, color: '#E74C3C' };
    return { icon: <FaBatteryEmpty />, color: '#E74C3C' };
  };

  const batteryStyle = getBatteryStyle();

  return (
    <div className="power-page-container">
      <div className="power-card card">
        {/* Secção Principal da Bateria */}
        <div className="main-battery-info">
          <div className="battery-level">
            {/* 3. Renderizar o ícone dinâmico */}
            <div className="battery-icon" style={{ color: batteryStyle.color }}>
              {batteryStyle.icon}
            </div>
            <div className="battery-text">
              <span className="battery-percentage">{percentage}</span>
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          <div className="battery-bar-container">
            <div className="battery-bar-track">
              <div 
                className="battery-bar-fill" 
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: batteryStyle.color 
                }} 
              />
            </div>
            <span className="battery-bar-label">{t('battery_charge')}</span>
          </div>
        </div>

        {/* Grelha de Detalhes Adicionais (sem alterações) */}
        <div className="power-details-grid">
          <div className="detail-item">
            <FaBolt className="detail-icon" style={{ color: '#f1c40f' }} />
            <div className="detail-text">
              <span className="detail-label">{t('voltage')}</span>
              <span className="detail-value">{renderSensorValue(voltage, ' V', 1)}</span>
            </div>
          </div>
          <div className="detail-item">
            <IoBarChart className="detail-icon" style={{ color: '#3498db' }} />
            <div className="detail-text">
              <span className="detail-label">{t('current_draw')}</span>
              <span className="detail-value">{renderSensorValue(currentDraw, ' A', 1)}</span>
            </div>
          </div>
          <div className="detail-item">
            <FaTemperatureHigh className="detail-icon" style={{ color: '#e74c3c' }} />
            <div className="detail-text">
              <span className="detail-label">{t('temperature')}</span>
              <span className="detail-value">{renderSensorValue(temperature, '°C', 0)}</span>
            </div>
          </div>
          <div className="detail-item">
            <FaRegClock className="detail-icon" style={{ color: '#9b59b6' }} />
            <div className="detail-text">
              <span className="detail-label">{t('estimated_time_remaining')}</span>
              <span className="detail-value">{renderSensorValue(timeRemaining, ' h', 1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerPage;