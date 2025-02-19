// src/App.jsx
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
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

  // State to hold sensor values (used on the Home page)
  const [sensorData, setSensorData] = useState({
    date: "N/A",
    time: "N/A",
    speedKPH: 0,
    rpm: 0,
    batteryVoltage: 0,
    batteryPercentage: 0,
    windSpeed: 0,
    temp: 0,
    heading: 0, // New property for compass heading in degrees
  });

  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.173:8000/boat_log.csv")
        .then((response) => response.text())
        .then((csvText) => {
          const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
          });
          if (parsed.data && parsed.data.length > 0) {
            const latestRow = parsed.data[parsed.data.length - 1];
            setSensorData({
              date: latestRow.date,
              time: latestRow.time,
              speedKPH: parseFloat(latestRow.speedKPH),
              rpm: parseFloat(latestRow.rpm),
              batteryVoltage: parseFloat(latestRow.batteryVoltage),
              batteryPercentage: parseFloat(latestRow.batteryPercentage),
              windSpeed: parseFloat(latestRow.windSpeed),
              temp: parseFloat(latestRow.temp),
              heading: latestRow.heading ? parseFloat(latestRow.heading) : 0,
            });
          }
        })
        .catch((err) =>
          console.error("Error fetching boat_log.csv:", err)
        );
    };

    // Poll CSV data every 2 seconds when Home is active
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
          // Rout tab: display the navigation map with the animated compass
          <NavigationMap heading={sensorData.heading} />
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
