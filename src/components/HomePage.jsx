// src/components/HomePage.jsx
import React from 'react';
import GaugeChart from 'react-gauge-chart';
import { useTranslation } from 'react-i18next';
import { FaBatteryFull, FaTemperatureHigh } from "react-icons/fa";
import { WiStrongWind } from "react-icons/wi";

import { useSensorData } from '../context/SensorDataContext';
// Assumindo que moveremos a função para um arquivo de utilitários no próximo passo
import { renderSensorValue } from '../utils/formatters';

const HomePage = () => {
  const { t } = useTranslation();
  const { sensorData, fetchError } = useSensorData();

  return (
    <div className="dash-content">
      <div className="gauge-wrapper">
        <GaugeChart id="speed-gauge" nrOfLevels={10} arcsLength={[0.4, 0.3, 0.3]} colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
          needleColor="var(--gauge-needle)" needleBaseColor="var(--gauge-needle)" hideText percent={sensorData.speedKPH / 60}
          arcPadding={0.02} style={{ width: '300px' }} />
        <div className="gauge-label">
          <span className="gauge-value">{renderSensorValue(sensorData.speedKPH, '', 1)}</span>
          <span className="gauge-unit">KPH</span>
        </div>
        <div className="battery-bar">
          <span className="battery-bar-title"><FaBatteryFull /> {t('battery')}</span>
          <div className="battery-bar-track">
            <div className="battery-bar-fill" style={{ width: `${sensorData.batteryPercentage}%` }} />
          </div>
          <span className="battery-percentage-label">{renderSensorValue(sensorData.batteryPercentage, '%', 0)}</span>
        </div>
      </div>
      <div className="wind-speed-wrapper">
        <div className="wind-speed-display">
          <div className="wind-speed-header"><WiStrongWind size={32} /> <span className="wind-speed-label">{t('wind_speed')}</span></div>
          <span className="wind-speed-value">{renderSensorValue(sensorData.windSpeed, ' kts', 0)}</span>
        </div>
      </div>
      <div className="gauge-wrapper">
        <GaugeChart id="rpm-gauge" nrOfLevels={10} arcsLength={[0.6, 0.2, 0.2]} colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
          needleColor="var(--gauge-needle)" needleBaseColor="var(--gauge-needle)" hideText percent={sensorData.rpm / 4000}
          arcPadding={0.02} style={{ width: '300px' }} />
        <div className="gauge-label">
          <span className="gauge-value">{renderSensorValue(sensorData.rpm)}</span>
          <span className="gauge-unit">RPM</span>
        </div>
        <div className="temperature-display">
          <FaTemperatureHigh/> <span>{t('temperature')}: {renderSensorValue(sensorData.temp, '°C', 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;