// src/App.jsx
import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { 
  FaBatteryFull, 
  FaTemperatureHigh 
} from "react-icons/fa";
import { 
  MdSettings, 
  MdPowerSettingsNew, 
  MdHome, 
  MdSurfing 
} from "react-icons/md";
import { GiPathDistance } from "react-icons/gi";
import { WiStrongWind } from "react-icons/wi";
import SettingsPage from "./components/SettingsPage";
import NavigationMap from "./components/NavigationMap";
import "./App.css";

function App() {
  // Manage active tab: "home", "rout", "settings", etc.
  const [activeTab, setActiveTab] = useState("home");

  // State to hold sensor data from the API.
  const [sensorData, setSensorData] = useState({
    date: "N/A",
    time: "N/A",
    speedKPH: 0,
    rpm: 0,
    batteryVoltage: 0,
    batteryPercentage: 0,
    windSpeed: 0,
    temp: 0,
    heading: 0, // Default heading, if not provided by the API.
  });

  // Function to fetch data from the API.
  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.173:8000/api/latest")
        .then((response) => response.json())
        .then((data) => {
          // Map the JSON fields from the API to our sensorData state.
          // Assuming the API returns keys like: Timestamp, Velocidade_KPH, RPM, Voltagem_bateria, Porcentagem_bateria, Velocidade_vento, Temperatura
          setSensorData({
            // Split Timestamp into date and time (customize as needed)
            date: data.Timestamp ? data.Timestamp.split(" ")[0] : "N/A",
            time: data.Timestamp ? data.Timestamp.split(" ")[1] : "N/A",
            speedKPH: data.Velocidade_KPH || 0,
            rpm: data.RPM || 0,
            batteryVoltage: data.Voltagem_bateria || 0,
            batteryPercentage: data.Porcentagem_bateria || 0,
            windSpeed: data.Velocidade_vento || 0,
            temp: data.Temperatura || 0,
            heading: data.heading || 0, // If heading is not provided, default to 0
          });
        })
        .catch((err) => console.error("Error fetching sensor data:", err));
    };

    // Poll data every 2 seconds when the Home tab is active.
    if (activeTab === "home") {
      fetchData();
      const intervalId = setInterval(fetchData, 2000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      {/* Top Bar (common to all tabs) */}
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
          <div className="temperature">
            <FaTemperatureHigh />
            <span>{sensorData.temp}°C</span>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="main-dash">
        {activeTab === "home" ? (
          <div className="dash-content">
            {/* Left Column: Speed Gauge */}
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
              {/* Battery Bar below Speed Gauge */}
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

            {/* Center Column: Wind Speed */}
            <div className="wind-speed-wrapper">
              <div className="wind-speed-display">
                <div className="wind-speed-header">
                  <WiStrongWind size={32} />
                  <span className="wind-speed-label">Wind Speed</span>
                </div>
                <span className="wind-speed-value">{sensorData.windSpeed} kts</span>
              </div>
            </div>

            {/* Right Column: RPM Gauge */}
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
              {/* Temperature Bar below RPM Gauge */}
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
          // Rout tab: display the navigation map with compass and metrics
          <NavigationMap heading={sensorData.heading} metrics={{
            coordinates: { lat: sensorData.lat || 0, lng: sensorData.lng || 0 },
            eta: "N/A",                // Replace with real values if available
            timeRemaining: "N/A",      // Replace with real values if available
            batteryRange: "N/A",       // Replace with real values if available
          }} />
        ) : activeTab === "settings" ? (
          <SettingsPage />
        ) : (
          <div className="dash-content">
            <p>Other tabs not implemented yet.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation (common to all tabs) */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => setActiveTab("home")}>
          <MdHome size={22} />
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => setActiveTab("power")}>
          <MdPowerSettingsNew size={22} />
          <span>Power</span>
        </div>
        <div className="nav-item" onClick={() => setActiveTab("surf")}>
          <MdSurfing size={22} />
          <span>Surf</span>
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
