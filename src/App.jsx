// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { FaBatteryFull, FaTemperatureHigh, FaExclamationTriangle } from "react-icons/fa";
import { MdSettings, MdPowerSettingsNew, MdHome, MdWifiOff, MdWifi } from "react-icons/md";
import { GiPathDistance } from "react-icons/gi";
import { WiThunderstorm } from "react-icons/wi";

import HomePage from "./components/HomePage";
import SettingsPage from "./components/SettingsPage";
import NavigationMap from "./components/NavigationMap";
import PowerPage from "./components/PowerPage";
import { useSensorData } from './context/SensorDataContext';
import { useAlerts } from './context/AlertContext'; // 1. Importar o hook de alertas
import AlertsDisplay from './components/AlertsDisplay'; // 2. Importar o componente de exibição
import { renderSensorValue } from './utils/formatters';
import "./App.css";

function App() {
  const { t } = useTranslation();
  const { sensorData, fetchError, isLoading } = useSensorData();
  const { addAlert, removeAlert } = useAlerts(); // 3. Obter as funções do contexto
  const wifiConnected = true;

  // 4. Lógica para verificar e disparar alertas
  useEffect(() => {
    // Alerta de Temperatura Alta (Exemplo: Perigo)
    if (!fetchError && sensorData.temp > 45) {
      addAlert('high_temp', t('high_temp_warning'), 'danger');
    } else {
      removeAlert('high_temp');
    }

    // Alerta de Bateria Baixa (Exemplo: Aviso)
    if (!fetchError && sensorData.batteryPercentage < 20) {
      addAlert('low_battery', t('low_battery_warning'), 'warning');
    } else {
      removeAlert('low_battery');
    }

  }, [sensorData, fetchError, addAlert, removeAlert, t]); // Dependências do efeito

  return (
    <div className="dashboard-container">
      {/* === Top Bar === */}
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
            {isLoading ? (
              <div className="skeleton skeleton-text" style={{ width: '50px', marginLeft: '0.4rem' }}></div>
            ) : (
              <span>{renderSensorValue(sensorData.batteryVoltage, 'V', 1, fetchError)}</span>
            )}
          </div>
          <div className="wifi-status">
            { !wifiConnected ? ( <MdWifiOff color="red" title={t('wifi_disconnected')} size={20} /> ) : ( <MdWifi title={t('wifi_connected')} size={20} /> )}
          </div>
          <div className="temperature">
            <FaTemperatureHigh />
            {isLoading ? (
              <div className="skeleton skeleton-text" style={{ width: '40px', marginLeft: '0.4rem' }}></div>
            ) : (
              <span>{renderSensorValue(sensorData.temp, '°C', 0, fetchError)}</span>
            )}
          </div>
          {/* 5. A secção de avisos (<div className="warnings">) foi removida daqui */}
        </div>
      </div>

      {/* 6. Componente que exibe os alertas */}
      <AlertsDisplay />

      {/* Conteúdo Central */}
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

      {/* Navegação Inferior */}
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