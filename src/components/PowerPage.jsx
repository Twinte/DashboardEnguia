// src/components/PowerPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import GaugeChart from 'react-gauge-chart';
import { FaBolt, FaTemperatureHigh, FaBatteryFull } from 'react-icons/fa';
import './PowerPage.css';
import { useSensorData } from '../context/SensorDataContext'; // Importar o hook

const batteryPercentColors = ["#E74C3C", "#F1C40F", "#2ECC71"];
const batteryPercentLimits = [0.2, 0.5, 1];

const PowerPage = () => { // Remover a prop 'sensorData'
  const { t } = useTranslation();
  const { sensorData } = useSensorData(); // Usar o hook para obter os dados

  // Extrair dados relevantes do sensorData para clareza
  const percentage = sensorData?.batteryPercentage || 0;
  const voltage = sensorData?.batteryVoltage || 0;
  const temperature = sensorData?.temp || 0;

  const gaugePercent = percentage / 100;

  return (
    <div className="power-page-container">
      {/* O resto do componente permanece o mesmo */}
      <div className="power-main-gauge">
        <GaugeChart
          id="battery-percentage-gauge"
          nrOfLevels={30}
          arcsLength={batteryPercentLimits}
          colors={batteryPercentColors}
          percent={gaugePercent}
          arcPadding={0.02}
          needleColor="var(--gauge-needle)"
          needleBaseColor="var(--gauge-needle)"
          hideText
          style={{ width: '70%', maxWidth: '400px' }}
        />
        <div className="power-percentage-label">
          <FaBatteryFull className="label-icon" />
          <span className="value">{percentage}%</span>
          <span className="unit">{t('battery_charge')}</span>
        </div>
      </div>
      <div className="power-details">
        <div className="detail-item">
          <FaBolt className="detail-icon voltage-icon" />
          <div className="detail-text">
            <span className="detail-label">{t('voltage')}</span>
            <span className="detail-value">{voltage.toFixed(1)} V</span>
          </div>
        </div>
        <div className="detail-item">
          <FaTemperatureHigh className="detail-icon temp-icon" />
          <div className="detail-text">
            <span className="detail-label">{t('temperature')}</span>
            <span className="detail-value">{temperature}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerPage;