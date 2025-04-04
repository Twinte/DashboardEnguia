// src/App.jsx
import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
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
import "./App.css";

function App() {
  // Gerenciar a aba ativa: "home", "rout", "settings", etc.
  const [activeTab, setActiveTab] = useState("home");

  // Estado para armazenar os dados dos sensores vindos da API.
  const [sensorData, setSensorData] = useState({
    date: "N/A",
    time: "N/A",
    speedKPH: 0,
    rpm: 0,
    batteryVoltage: 0,
    batteryPercentage: 100, // Assumindo 100% inicialmente
    windSpeed: 0,
    temp: 0,
    heading: 0, // Valor padrão de heading se não fornecido pela API.
    lat: 0,
    lng: 0,
  });

  // Variável simulada para o sinal WiFi: true se conectado, false se não.
  const wifiConnected = true; // Altere para false para testar

  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.173:8000/api/latest")
        .then((response) => response.json())
        .then((data) => {
          setSensorData({
            date: data.Timestamp ? data.Timestamp.split(" ")[0] : "N/A",
            time: data.Timestamp ? data.Timestamp.split(" ")[1] : "N/A",
            speedKPH: data.Velocidade_KPH || 0,
            rpm: data.RPM || 0,
            batteryVoltage: data.Voltagem_bateria || 0,
            batteryPercentage: data.Porcentagem_bateria || 100,
            windSpeed: data.Velocidade_vento || 0,
            temp: data.Temperatura || 0,
            heading: data.heading || 0,
            lat: data.lat || 51.505,   // Se houver dados de localização, use-os; senão, padrão
            lng: data.lng || -0.09,
          });
        })
        .catch((err) => console.error("Error fetching sensor data:", err));
    };

    // Busca os dados a cada 2 segundos quando a aba "home" estiver ativa.
    if (activeTab === "home") {
      fetchData();
      const intervalId = setInterval(fetchData, 2000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      {/* Top Bar (comum a todas as abas) */}
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
          {/* Ícone de WiFi posicionado entre a bateria e a temperatura */}
          <div className="wifi-status">
            { !wifiConnected ? (
              <MdWifiOff color="red" title="Sem sinal de WiFi" size={20} />
            ) : (
              <MdWifi color="white" title="WiFi conectado" size={20} />
            )}
          </div>
          <div className="temperature">
            <FaTemperatureHigh />
            <span>{sensorData.temp}°C</span>
          </div>
          {/* Outros ícones de alerta (excluindo o WiFi, que já está posicionado separadamente) */}
          <div className="warnings">
            { sensorData.temp > 40 && (
              <FaExclamationTriangle color="red" title="Temperatura alta" size={20} />
            )}
            { sensorData.batteryPercentage < 20 && (
              <FaExclamationTriangle color="red" title="Bateria baixa" size={20} />
            )}
            { sensorData.windSpeed > 70 && (
              <WiThunderstorm color="red" title="Condições climáticas adversas" size={20} />
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
                arcsLength={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
                colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
                needleColor="#fff"
                needleBaseColor="#fff"
                hideText
                percent={sensorData.speedKPH / 140}
                arcPadding={0.02}
              />
              <div className="gauge-label">
                <span className="gauge-value">{sensorData.speedKPH}</span>
                <span className="gauge-unit">KPH</span>
              </div>
              <div className="battery-bar">
                <span className="battery-bar-title">
                  <FaBatteryFull style={{ marginRight: "4px" }} />
                  Battery
                </span>
                <div className="battery-bar-track">
                  <div
                    className="battery-bar-fill"
                    style={{ width: `${sensorData.batteryPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Coluna Central: Velocidade do Vento */}
            <div className="wind-speed-wrapper">
              <div className="wind-speed-display">
                <div className="wind-speed-header">
                  <WiStrongWind size={32} />
                  <span className="wind-speed-label">Wind Speed</span>
                </div>
                <span className="wind-speed-value">{sensorData.windSpeed} kts</span>
              </div>
            </div>

            {/* Coluna Direita: Gauge de RPM */}
            <div className="gauge-wrapper">
              <GaugeChart
                id="rpm-gauge"
                nrOfLevels={10}
                arcsLength={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
                colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
                needleColor="#fff"
                needleBaseColor="#fff"
                hideText
                percent={sensorData.rpm / 6000}
                arcPadding={0.02}
              />
              <div className="gauge-label">
                <span className="gauge-value">{sensorData.rpm}</span>
                <span className="gauge-unit">RPM</span>
              </div>
              <div className="battery-bar">
                <span className="battery-bar-title">Temp</span>
                <div className="battery-bar-track">
                  <div
                    className="battery-bar-fill"
                    style={{ width: "75%", backgroundColor: "#E74C3C" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "rout" ? (
          <NavigationMap heading={sensorData.heading} metrics={{
            coordinates: { lat: sensorData.lat || 0, lng: sensorData.lng || 0 },
            eta: "N/A",                
            timeRemaining: "N/A",      
            batteryRange: "N/A",       
          }} />
        ) : activeTab === "settings" ? (
          <SettingsPage />
        ) : (
          <div className="dash-content">
            <p>Other tabs not implemented yet.</p>
          </div>
        )}
      </div>

      {/* Navegação Inferior (comum a todas as abas) */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => setActiveTab("home")}>
          <MdHome size={22} />
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => setActiveTab("power")}>
          <MdPowerSettingsNew size={22} />
          <span>Power</span>
        </div>
        <div className="nav-item" onClick={() => setActiveTab("rout")}>
          <GiPathDistance size={22} />
          <span>Rout</span>
        </div>
        <div className="nav-item" onClick={() => setActiveTab("settings")}>
          <MdSettings size={22} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}

export default App;
