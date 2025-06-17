// src/App.jsx
import React from "react";
// 1. Importar componentes do React Router
import { Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 2. Importar Ícones e Componentes
import { FaBatteryFull, FaTemperatureHigh, FaExclamationTriangle } from "react-icons/fa";
import { MdSettings, MdPowerSettingsNew, MdHome, MdWifiOff, MdWifi } from "react-icons/md";
import { GiPathDistance } from "react-icons/gi";
import { WiStrongWind, WiThunderstorm } from "react-icons/wi";

import HomePage from "./components/HomePage";
import SettingsPage from "./components/SettingsPage";
import NavigationMap from "./components/NavigationMap";
import PowerPage from "./components/PowerPage";
import { useSensorData } from './context/SensorDataContext';
import { renderSensorValue } from './utils/formatters'; // Importando a função utilitária
import "./App.css";

function App() {
  const { t } = useTranslation();
  const { sensorData, fetchError } = useSensorData();
  const wifiConnected = true;

  return (
    <div className="dashboard-container">
      {/* === Top Bar (usa renderSensorValue importado) === */}
      <div className="top-bar">
        {fetchError && <div className="fetch-error-indicator" title={t('fetch_error_tooltip')}>⚠️</div>}
        <div className="top-left">
          <span className="date">{renderSensorValue(sensorData.date, '', null, fetchError)}</span>
        </div>
        <div className="top-center">
          <span className="time">{renderSensorValue(sensorData.time, '', null, fetchError)}</span>
        </div>
        <div className="top-right">
          <div className="battery-level" title={`${t('battery_percentage')}: ${renderSensorValue(sensorData.batteryPercentage, '%', 0, fetchError)}`}>
            <FaBatteryFull />
            <span>{renderSensorValue(sensorData.batteryVoltage, 'V', 1, fetchError)}</span>
          </div>
          <div className="wifi-status">
            { !wifiConnected ? ( <MdWifiOff color="red" title={t('wifi_disconnected')} size={20} /> ) : ( <MdWifi title={t('wifi_connected')} size={20} /> )}
          </div>
          <div className="temperature">
            <FaTemperatureHigh />
            <span>{renderSensorValue(sensorData.temp, '°C', 0, fetchError)}</span>
          </div>
          <div className="warnings">
            { !fetchError && sensorData.temp > 45 && ( <FaExclamationTriangle color="orange" title={t('high_temp_warning')} size={20} /> )}
            { !fetchError && sensorData.batteryPercentage < 20 && ( <FaExclamationTriangle color="yellow" title={t('low_battery_warning')} size={20} /> )}
            { !fetchError && sensorData.windSpeed > 40 && ( <WiThunderstorm color="lightblue" title={t('adverse_weather_warning')} size={20} /> )}
          </div>
        </div>
      </div>

      {/* 3. Conteúdo Central agora controlado pelo Roteador */}
      <div className="main-dash">
        {fetchError && <div className="fetch-error-message"><FaExclamationTriangle size={40} color="orange" /><p>{t('sensor_data_unavailable')}</p></div>}
        
        {!fetchError && (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/power" element={<PowerPage />} />
            <Route path="/route" element={<NavigationMap />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        )}
      </div>

      {/* 4. Navegação Inferior agora usa NavLink */}
      <div className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MdHome size={22} /> <span>{t('home_tab')}</span>
        </NavLink>
        <NavLink to="/power" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MdPowerSettingsNew size={22} /> <span>{t('power_tab')}</span>
        </NavLink>
        <NavLink to="/route" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GiPathDistance size={22} /> <span>{t('rout_tab')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MdSettings size={22} /> <span>{t('settings_tab')}</span>
        </NavLink>
      </div>
    </div>
  );
}

export default App;