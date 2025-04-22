// src/App.jsx
import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { useTranslation } from 'react-i18next'; 
import { 
  FaBatteryFull, 
  FaTemperatureHigh, 
  FaExclamationTriangle 
} from "react-icons/fa";
import { 
  MdSettings, 
  MdPowerSettingsNew, 
  MdHome, 
  MdWifiOff, 
  MdWifi 
} from "react-icons/md";
import { GiPathDistance } from "react-icons/gi";
import { WiStrongWind, WiThunderstorm } from "react-icons/wi";
import SettingsPage from "./components/SettingsPage"; 
import NavigationMap from "./components/NavigationMap";
import "./App.css"; // Importa o CSS atualizado

function App() {
  const { t } = useTranslation(); 

  const [activeTab, setActiveTab] = useState("home");

  const [sensorData, setSensorData] = useState({
    date: "N/A",
    time: "N/A",
    speedKPH: 0,
    rpm: 0,
    batteryVoltage: 0,
    batteryPercentage: 100, 
    windSpeed: 0,
    temp: 0,
    heading: 0, 
    lat: 0,
    lng: 0,
  });

  const wifiConnected = true; 

  useEffect(() => {
    const fetchData = () => {
      // Simulação de dados (ou use seu fetch real)
      const simulatedData = {
         date: new Date().toLocaleDateString(),
         time: new Date().toLocaleTimeString(),
         speedKPH: Math.random() * 100,
         rpm: Math.random() * 5000,
         batteryVoltage: 12 + Math.random() * 2,
         batteryPercentage: 80 + Math.random() * 20,
         windSpeed: Math.random() * 40,
         temp: 20 + Math.random() * 15,
         heading: Math.random() * 360,
         lat: 51.505 + (Math.random() - 0.5) * 0.1,
         lng: -0.09 + (Math.random() - 0.5) * 0.1,
       };
       setSensorData({
         ...simulatedData,
         speedKPH: parseFloat(simulatedData.speedKPH.toFixed(1)),
         rpm: parseInt(simulatedData.rpm),
         batteryVoltage: parseFloat(simulatedData.batteryVoltage.toFixed(1)),
         batteryPercentage: parseInt(simulatedData.batteryPercentage),
         windSpeed: parseInt(simulatedData.windSpeed),
         temp: parseInt(simulatedData.temp),
         heading: parseInt(simulatedData.heading),
         lat: parseFloat(simulatedData.lat.toFixed(4)),
         lng: parseFloat(simulatedData.lng.toFixed(4)),
       });
    };

    let intervalId = null;
    if (activeTab === "home") {
      fetchData(); 
      intervalId = setInterval(fetchData, 2000); 
    }
    
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
  }, [activeTab]); 

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-left">
          <span className="date">{sensorData.date}</span>
        </div>
        <div className="top-center">
          <span className="time">{sensorData.time}</span>
        </div>
        <div className="top-right">
          <div className="battery-level">
            <FaBatteryFull />
            <span>{sensorData.batteryVoltage.toFixed(1)}V</span>
          </div>
          <div className="wifi-status">
            { !wifiConnected ? (
              <MdWifiOff color="red" title={t('wifi_disconnected')} size={20} /> 
            ) : (
              <MdWifi color="white" title={t('wifi_connected')} size={20} /> 
            )}
          </div>
          <div className="temperature">
            <FaTemperatureHigh />
            <span>{sensorData.temp}°C</span>
          </div>
          <div className="warnings">
            { sensorData.temp > 40 && (
              <FaExclamationTriangle color="orange" title={t('high_temp_warning')} size={20} /> 
            )}
            { sensorData.batteryPercentage < 20 && (
              <FaExclamationTriangle color="yellow" title={t('low_battery_warning')} size={20} /> 
            )}
            { sensorData.windSpeed > 70 && ( 
              <WiThunderstorm color="lightblue" title={t('adverse_weather_warning')} size={20} /> 
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="main-dash">
        {activeTab === "home" ? (
          <div className="dash-content">
            {/* Coluna Esquerda: Gauge de Velocidade */}
            <div className="gauge-wrapper">
              <GaugeChart
                id="speed-gauge"
                nrOfLevels={10}
                arcsLength={[0.2, 0.2, 0.2, 0.4]} 
                colors={["#2ECC71", "#F1C40F", "#E74C3C"]} 
                needleColor="var(--gauge-needle)" 
                needleBaseColor="var(--gauge-needle)" 
                hideText 
                percent={sensorData.speedKPH / 100} 
                arcPadding={0.02}
                style={{ width: '300px' }} 
              />
              <div className="gauge-label">
                <span className="gauge-value">{sensorData.speedKPH.toFixed(1)}</span>
                <span className="gauge-unit">KPH</span>
              </div>
              <div className="battery-bar">
                <span className="battery-bar-title">
                  <FaBatteryFull style={{ marginRight: "4px" }} />
                   {t('battery')} 
                </span>
                <div className="battery-bar-track">
                  <div
                    className="battery-bar-fill"
                    style={{ width: `${sensorData.batteryPercentage}%` }}
                  />
                </div>
                 <span className="battery-percentage-label">{sensorData.batteryPercentage}%</span> 
              </div>
            </div>

            {/* Coluna Central: Velocidade do Vento */}
            <div className="wind-speed-wrapper">
              <div className="wind-speed-display">
                <div className="wind-speed-header">
                  <WiStrongWind size={32} />
                  <span className="wind-speed-label">{t('wind_speed')}</span> 
                </div>
                <span className="wind-speed-value">{sensorData.windSpeed} kts</span>
              </div>
            </div>

            {/* Coluna Direita: Gauge de RPM */}
            <div className="gauge-wrapper">
              <GaugeChart
                id="rpm-gauge"
                nrOfLevels={10}
                arcsLength={[0.5, 0.3, 0.2]} 
                colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
                needleColor="var(--gauge-needle)" 
                needleBaseColor="var(--gauge-needle)" 
                hideText
                percent={sensorData.rpm / 6000} 
                arcPadding={0.02}
                 style={{ width: '300px' }} 
              />
              <div className="gauge-label">
                <span className="gauge-value">{sensorData.rpm}</span>
                <span className="gauge-unit">RPM</span>
              </div>
              {/* DIV que contém o ícone e o texto da temperatura */}
              <div className="temperature-display">  
                 <FaTemperatureHigh /* style removido daqui */ /> 
                 <span>{t('temperature')}: {sensorData.temp}°C</span> 
              </div>
            </div>
          </div>
        ) : activeTab === "rout" ? (
          <NavigationMap 
            heading={sensorData.heading} 
            initialLat={sensorData.lat} 
            initialLng={sensorData.lng}
          />
        ) : activeTab === "settings" ? (
          <SettingsPage /> 
        ) : activeTab === "power" ? (
           <div className="dash-content"><p>{t('power_tab_content_placeholder')}</p></div> 
        ) : (
          <div className="dash-content">
            <p>{t('tab_not_implemented')}</p> 
          </div>
        )}
      </div>

      {/* Navegação Inferior */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab("home")}>
          <MdHome size={22} />
          <span>{t('home_tab')}</span> 
        </div>
        <div className={`nav-item ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab("power")}>
          <MdPowerSettingsNew size={22} />
          <span>{t('power_tab')}</span> 
        </div>
        <div className={`nav-item ${activeTab === 'rout' ? 'active' : ''}`} onClick={() => setActiveTab("rout")}>
          <GiPathDistance size={22} />
          <span>{t('rout_tab')}</span> 
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab("settings")}>
          <MdSettings size={22} />
          <span>{t('settings_tab')}</span> 
        </div>
      </div>
    </div>
  );
}

export default App;