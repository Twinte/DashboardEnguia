// src/components/HomePage.jsx
import React, { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';
import { useTranslation } from 'react-i18next';
import { useSensorData } from '../context/SensorDataContext';
import './HomePage.css'; // <--- IMPORT THE NEW CSS FILE HERE

const HomePage = () => {
  const { t } = useTranslation();
  const { sensorData, isLoading } = useSensorData();
  
  const [prevSpeedPercent, setPrevSpeedPercent] = useState(0);
  const [prevRpmPercent, setPrevRpmPercent] = useState(0);

  useEffect(() => {
    if (!isLoading && sensorData) {
      // Calculate percentages for the gauge visual (0.0 to 1.0)
      // Assuming max speed 100 KPH and max RPM 4000
      setPrevSpeedPercent(Math.min(sensorData.speedKPH / 100, 1));
      setPrevRpmPercent(Math.min(sensorData.rpm / 4000, 1));
    }
  }, [sensorData.speedKPH, sensorData.rpm, isLoading]);

  // Simple loading state
  if (isLoading) {
    return <div className="loading-screen">SYSTEM INITIALIZING...</div>;
  }

  return (
    <div className="home-grid">
      
      {/* --- LEFT COLUMN: SPEED GAUGE --- */}
      <div className="gauge-section left">
        <div className="gauge-ring">
           <GaugeChart 
              id="speed-gauge" 
              nrOfLevels={20} 
              // Green -> Yellow -> Red colors
              colors={["#2ECC71", "#F1C40F", "#E74C3C"]} 
              arcWidth={0.3} 
              percent={prevSpeedPercent} 
              needleColor="var(--gauge-needle)"
              needleBaseColor="var(--gauge-needle)"
              textColor="transparent" // Hide default text
              hideText={true} 
              animate={true}
           />
           {/* Custom Text Overlay */}
           <div className="gauge-inner-text">
             <span className="value-large">{parseFloat(sensorData.speedKPH).toFixed(0)}</span>
             <span className="unit-label">KPH</span>
           </div>
        </div>
        
        {/* Fake Fuel Bar (Visual Only based on Battery for now) */}
        <div className="gauge-footer-bar">
           <div className="bar-track">
              <div 
                className="bar-fill" 
                style={{ width: `${sensorData.batteryPercentage}%`, backgroundColor: sensorData.batteryPercentage < 20 ? '#E74C3C' : '#2ECC71' }}
              ></div>
           </div>
           <div className="bar-labels">
              <span>E</span>
              <span>FUEL (BAT)</span>
              <span>F</span>
           </div>
        </div>
      </div>

      {/* --- CENTER COLUMN: LOGO & INFO --- */}
      <div className="center-section">
         <div className="logo-area">
            <span className="logo-text">ENGUIA</span>
         </div>
         
         {/* Central Bubble: Showing Wind or Oil Pressure */}
         <div className="central-info-bubble">
            <span className="bubble-label">{t('wind_speed')}</span>
            <span className="bubble-value">{sensorData.windSpeed}</span>
            <span className="bubble-unit">KTS</span>
         </div>

         {/* Trim Indicators (Static/Visual for layout) */}
         <div className="trim-controls">
            <span className="trim-label">TRIM</span>
            <div className="trim-indicators">
               <div className="trim-bar"><div className="trim-fill" style={{height: '60%'}}></div></div>
               <div className="trim-bar"><div className="trim-fill" style={{height: '60%'}}></div></div>
            </div>
         </div>
      </div>

      {/* --- RIGHT COLUMN: RPM GAUGE --- */}
      <div className="gauge-section right">
        <div className="gauge-ring">
           <GaugeChart 
              id="rpm-gauge" 
              nrOfLevels={20} 
              colors={["#00A3FF", "#2ECC71", "#E74C3C"]} 
              arcWidth={0.3} 
              percent={prevRpmPercent} 
              needleColor="var(--gauge-needle)"
              needleBaseColor="var(--gauge-needle)"
              hideText={true}
              animate={true}
           />
           <div className="gauge-inner-text">
             <span className="value-large">{sensorData.rpm}</span>
             <span className="unit-label">RPM</span>
           </div>
        </div>

        {/* Temp Bar */}
        <div className="gauge-footer-bar">
           <div className="bar-track">
              {/* Simulating Temp bar fill roughly based on 0-100C */}
              <div 
                className="bar-fill" 
                style={{ width: `${Math.min(sensorData.temp, 100)}%`, backgroundColor: sensorData.temp > 80 ? '#E74C3C' : '#00A3FF' }}
              ></div>
           </div>
           <div className="bar-labels">
              <span>C</span>
              <span>TEMP {sensorData.temp}°</span>
              <span>H</span>
           </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;