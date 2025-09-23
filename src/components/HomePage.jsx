// src/components/HomePage.jsx
import React from 'react';
import GaugeChart from 'react-gauge-chart';
import { useTranslation } from 'react-i18next';
import { FaBatteryFull, FaTemperatureHigh } from "react-icons/fa";
import { WiStrongWind } from "react-icons/wi";
import { useSensorData } from '../context/SensorDataContext';
import { renderSensorValue } from '../utils/formatters';

const HomePage = () => {
  const { t } = useTranslation();
  const { sensorData, fetchError, isLoading } = useSensorData();

  // Componente Skeleton dedicado para a HomePage
  const HomePageSkeleton = () => (
    <div className="dash-content">
      <div className="gauge-wrapper">
        <div className="skeleton skeleton-circle" style={{ width: '300px', height: '180px' }}></div>
        <div className="skeleton skeleton-gauge-label"></div>
        <div className="skeleton skeleton-text" style={{ width: '150px', height: '30px', marginTop: '1rem', borderRadius: '4px' }}></div>
      </div>
      <div className="wind-speed-wrapper">
          <div className="skeleton skeleton-text" style={{ width: '120px', height: '2rem', borderRadius: '4px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '80px', height: '2.5rem', marginTop: '0.5rem', borderRadius: '4px' }}></div>
      </div>
      <div className="gauge-wrapper">
        <div className="skeleton skeleton-circle" style={{ width: '300px', height: '180px' }}></div>
        <div className="skeleton skeleton-gauge-label"></div>
        <div className="skeleton skeleton-text" style={{ width: '150px', height: '25px', marginTop: '0.75rem', borderRadius: '4px' }}></div>
      </div>
    </div>
  );

  // Se estiver a carregar, mostra o skeleton
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  // Se não estiver a carregar, mostra o conteúdo real
  return (
    <div className="dash-content">
      <div className="gauge-wrapper">
        <GaugeChart 
            id="speed-gauge" 
            nrOfLevels={10} 
            arcsLength={[0.4, 0.3, 0.3]} 
            colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
            needleColor="var(--gauge-needle)" 
            needleBaseColor="var(--gauge-needle)" 
            hideText 
            percent={sensorData.speedKPH / 100}
            arcPadding={0.02} 
            style={{ width: '300px' }} 
        />
        <div className="gauge-label">
          <span className="gauge-value">{renderSensorValue(sensorData.speedKPH, '', 1, fetchError)}</span>
          <span className="gauge-unit">KPH</span>
        </div>
        <div className="battery-bar">
          <span className="battery-bar-title"><FaBatteryFull /> {t('battery')}</span>
          <div className="battery-bar-track">
            <div className="battery-bar-fill" style={{ width: `${sensorData.batteryPercentage}%` }} />
          </div>
          <span className="battery-percentage-label">{renderSensorValue(sensorData.batteryPercentage, '%', 0, fetchError)}</span>
        </div>
      </div>
      <div className="wind-speed-wrapper">
        <div className="wind-speed-display">
          <div className="wind-speed-header"><WiStrongWind size={32} /> <span className="wind-speed-label">{t('wind_speed')}</span></div>
          <span className="wind-speed-value">{renderSensorValue(sensorData.windSpeed, ' kts', 0, fetchError)}</span>
        </div>
      </div>
      <div className="gauge-wrapper">
        <GaugeChart 
            id="rpm-gauge" 
            nrOfLevels={10} 
            arcsLength={[0.6, 0.2, 0.2]} 
            colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
            needleColor="var(--gauge-needle)" 
            needleBaseColor="var(--gauge-needle)" 
            hideText 
            percent={sensorData.rpm / 4000}
            arcPadding={0.02} 
            style={{ width: '300px' }} 
        />
        <div className="gauge-label">
          <span className="gauge-value">{renderSensorValue(sensorData.rpm, '', 0, fetchError)}</span>
          <span className="gauge-unit">RPM</span>
        </div>
        <div className="temperature-display">
          <FaTemperatureHigh/> <span>{t('temperature')}: {renderSensorValue(sensorData.temp, '°C', 0, fetchError)}</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;