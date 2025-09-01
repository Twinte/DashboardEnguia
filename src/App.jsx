// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Ícones de estado e de navegação
import { FaBatteryFull, FaTemperatureHigh, FaExclamationTriangle } from "react-icons/fa";
import { MdSettings, MdPowerSettingsNew, MdHome, MdWifiOff, MdWifi, MdCloud, MdCloudOff, MdCloudQueue } from "react-icons/md";
import { GiPathDistance } from "react-icons/gi";

// Ícones para o novo modo de energia
import { FaBolt, FaLeaf, FaBalanceScale } from 'react-icons/fa';

import HomePage from "./components/HomePage";
import SettingsPage from "./components/SettingsPage";
import NavigationMap from "./components/NavigationMap";
import PowerPage from "./components/PowerPage";
import { useSensorData } from './context/SensorDataContext';
import { useAlerts } from './context/AlertContext';
import AlertsDisplay from './components/AlertsDisplay';
import { renderSensorValue } from './utils/formatters';
import { useTrip } from './context/TripContext';
// Importa o hook de configurações para obter o modo de energia
import { useSettings } from './context/SettingsContext';
import "./App.css";

function App() {
  const { t } = useTranslation();
  const { sensorData, fetchError, isLoading } = useSensorData();
  const { addAlert, removeAlert } = useAlerts();
  const { mqttConnectionStatus } = useTrip();
  // Obtém o estado do modo de energia do contexto
  const { energyMode } = useSettings();
  const wifiConnected = true;

  useEffect(() => {
    if (!fetchError && sensorData.temp > 45) {
      addAlert('high_temp', t('high_temp_warning'), 'danger');
    } else {
      removeAlert('high_temp');
    }

    if (!fetchError && sensorData.batteryPercentage < 20) {
      addAlert('low_battery', t('low_battery_warning'), 'warning');
    } else {
      removeAlert('low_battery');
    }
  }, [sensorData, fetchError, addAlert, removeAlert, t]);

  const renderMqttIcon = () => {
    switch (mqttConnectionStatus) {
      case 'connected':
        return <MdCloud color="green" title="MQTT Conectado" size={20} />;
      case 'connecting':
        return <MdCloudQueue color="orange" title="MQTT Conectando..." size={20} />;
      case 'error':
      case 'disconnected':
        return <MdCloudOff color="red" title="MQTT Desconectado" size={20} />;
      default:
        return <MdCloudOff color="grey" title="MQTT Inativo" size={20} />;
    }
  };

  // Função para renderizar o ícone do modo de energia
  const renderEnergyModeIcon = () => {
    switch (energyMode) {
      case 'performance':
        return <FaBolt color="#E74C3C" title={t('performance_mode')} size={20} />; // Vermelho para performance
      case 'eco':
        return <FaLeaf color="#2ECC71" title={t('eco_mode')} size={20} />; // Verde para eco
      case 'balanced':
        return <FaBalanceScale color="#3498DB" title={t('balanced_mode')} size={20} />; // Azul para equilibrado
      default:
        return <FaBalanceScale color="grey" title={t('balanced_mode')} size={20} />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        {fetchError && <div className="fetch-error-indicator" title={t('fetch_error_tooltip')}>⚠️</div>}
        <div className="top-left">
          <span className="date">{renderSensorValue(sensorData.date, '', null, fetchError)}</span>
        </div>
        <div className="top-center">
          <span className="time">{renderSensorValue(sensorData.time, '', null, fetchError)}</span>
        </div>
        <div className="top-right">
          {/* Ícone do Modo de Energia adicionado aqui */}
          <div className="energy-mode-status">
            {renderEnergyModeIcon()}
          </div>
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
          <div className="mqtt-status">
            {renderMqttIcon()}
          </div>
        </div>
      </div>

      <AlertsDisplay />

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