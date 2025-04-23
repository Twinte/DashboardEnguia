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

// Importar os componentes das páginas/abas
import SettingsPage from "./components/SettingsPage"; 
import NavigationMap from "./components/NavigationMap";
import PowerPage from "./components/PowerPage"; 
import "./App.css"; 

function App() {
  const { t } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("home"); 

  // Estado para armazenar os dados dos sensores
  const [sensorData, setSensorData] = useState({
    date: "N/A",
    time: "N/A",
    speedKPH: 0,
    rpm: 0,
    batteryVoltage: 0, // Armazenado como número
    batteryPercentage: 0, 
    windSpeed: 0,
    temp: 0,
    heading: 0, 
    lat: 51.505, 
    lng: -0.09,  
  });
  
  const [fetchError, setFetchError] = useState(false); 

  const wifiConnected = true; // Pode vir do estado ou de uma verificação real

  // Efeito para buscar dados dos sensores do Raspberry Pi
  useEffect(() => {
    const fetchData = () => {
      setFetchError(false); 

      // *** Bloco fetch para dados reais - AGORA ATIVO ***
      fetch("http://192.168.1.173:8000/api/latest") // <<< CONFIRME ESTE ENDEREÇO IP E PORTA
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
           // Validação e atualização do estado com dados REAIS
           setSensorData({
              date: data.Timestamp ? data.Timestamp.split(" ")[0] : sensorData.date, 
              time: data.Timestamp ? data.Timestamp.split(" ")[1] : sensorData.time,
              speedKPH: parseFloat(data.Velocidade_KPH || 0).toFixed(1), // Formatado aqui pois é exibido diretamente
              rpm: parseInt(data.RPM || 0),
              // *** CORREÇÃO APLICADA AQUI: Armazenar como NÚMERO ***
              batteryVoltage: parseFloat(data.Voltagem_bateria || 0), // Sem .toFixed()!
              // ****************************************************
              batteryPercentage: parseInt(data.Porcentagem_bateria || 0), 
              windSpeed: parseInt(data.Velocidade_vento || 0),
              temp: parseInt(data.Temperatura || 0),
              heading: parseInt(data.heading || 0),
              lat: parseFloat(data.lat || sensorData.lat).toFixed(4), 
              lng: parseFloat(data.lng || sensorData.lng).toFixed(4),
           });
        })
        .catch((err) => {
          console.error("Falha ao buscar dados do sensor:", err);
          setFetchError(true); 
        });
      // *** Fim do Bloco fetch ***
    };

    let intervalId = null;
    if (activeTab === "home" || activeTab === "power") { 
      fetchData(); 
      intervalId = setInterval(fetchData, 2500); 
    }
    
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
  }, [activeTab]); 

  // Função auxiliar para renderizar valor ou 'N/A' em caso de erro
  const renderSensorValue = (value, unit = '', fixed = null) => {
    if (fetchError || value === undefined || value === null) return 'N/A';
    if (typeof value === 'number' && fixed !== null) {
        return `${value.toFixed(fixed)}${unit}`;
    }
    return `${value}${unit}`;
  }

  return (
    <div className="dashboard-container">
      {/* === Top Bar === */}
      <div className="top-bar">
         {fetchError && <div className="fetch-error-indicator" title={t('fetch_error_tooltip')}>⚠️</div>}
        <div className="top-left">
          <span className="date">{renderSensorValue(sensorData.date)}</span>
        </div>
        <div className="top-center">
          <span className="time">{renderSensorValue(sensorData.time)}</span>
        </div>
        <div className="top-right">
          <div className="battery-level" title={`${t('battery_percentage')}: ${renderSensorValue(sensorData.batteryPercentage, '%', 0)}`}> 
            <FaBatteryFull />
            {/* Usar a função auxiliar para formatar a voltagem aqui também */}
            <span>{renderSensorValue(sensorData.batteryVoltage, 'V', 1)}</span> 
          </div>
          <div className="wifi-status">
            { !wifiConnected ? ( <MdWifiOff color="red" title={t('wifi_disconnected')} size={20} /> ) : ( <MdWifi title={t('wifi_connected')} size={20} /> )}
          </div>
          <div className="temperature">
            <FaTemperatureHigh />
            <span>{renderSensorValue(sensorData.temp, '°C', 0)}</span>
          </div>
          <div className="warnings">
            { !fetchError && sensorData.temp > 45 && ( <FaExclamationTriangle color="orange" title={t('high_temp_warning')} size={20} /> )}
            { !fetchError && sensorData.batteryPercentage < 20 && ( <FaExclamationTriangle color="yellow" title={t('low_battery_warning')} size={20} /> )}
            { !fetchError && sensorData.windSpeed > 40 && ( <WiThunderstorm color="lightblue" title={t('adverse_weather_warning')} size={20} /> )}
          </div>
        </div>
      </div>

      {/* === Conteúdo Central (Varia com a Aba) === */}
      <div className="main-dash">
         {fetchError && activeTab !== 'settings' && activeTab !== 'rout' && (
            <div className="fetch-error-message">
                <FaExclamationTriangle size={40} color="orange" />
                <p>{t('sensor_data_unavailable')}</p>
            </div>
         )}

        {!fetchError && activeTab === "home" && (
          <div className="dash-content">
             <div className="gauge-wrapper">
               <GaugeChart id="speed-gauge" nrOfLevels={10} arcsLength={[0.4, 0.3, 0.3]} colors={["#2ECC71", "#F1C40F", "#E74C3C"]} 
                 needleColor="var(--gauge-needle)" needleBaseColor="var(--gauge-needle)" hideText percent={sensorData.speedKPH / 60}
                 arcPadding={0.02} style={{ width: '300px' }} />
               <div className="gauge-label">
                 <span className="gauge-value">{renderSensorValue(sensorData.speedKPH)}</span>
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
        )}
        
        {/* Passa sensorData para PowerPage, que agora receberá batteryVoltage como número */}
        {!fetchError && activeTab === "power" && (
          <PowerPage sensorData={sensorData} /> 
        )} 

        {activeTab === "rout" && ( 
          <NavigationMap 
            heading={sensorData.heading} 
            initialLat={sensorData.lat} 
            initialLng={sensorData.lng}
          />
        )} 
        
        {activeTab === "settings" && ( 
          <SettingsPage /> 
        )} 

        {!fetchError && !['home', 'power', 'rout', 'settings'].includes(activeTab) && (
             <div className="dash-content">
               <p>{t('tab_not_implemented', { tabName: activeTab })}</p> 
             </div>
        )}
      </div>

      {/* === Navegação Inferior === */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab("home")}> <MdHome size={22} /> <span>{t('home_tab')}</span> </div>
        <div className={`nav-item ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab("power")}> <MdPowerSettingsNew size={22} /> <span>{t('power_tab')}</span> </div>
        <div className={`nav-item ${activeTab === 'rout' ? 'active' : ''}`} onClick={() => setActiveTab("rout")}> <GiPathDistance size={22} /> <span>{t('rout_tab')}</span> </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab("settings")}> <MdSettings size={22} /> <span>{t('settings_tab')}</span> </div>
      </div>
    </div>
  );
}

export default App;