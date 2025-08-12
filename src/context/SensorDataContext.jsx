// src/context/SensorDataContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Criar o Contexto
const SensorDataContext = createContext();
const INITIAL_LATITUDE = -1.4558;
const INITIAL_LONGITUDE = -48.5036;

// 2. Criar o Provedor (Provider)
export const SensorDataProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    date: "N/A",
    time: "N/A",
    speedKPH: 0,
    rpm: 0,
    batteryVoltage: 0,
    batteryPercentage: 0,
    windSpeed: 0,
    temp: 0,
    heading: 0,
    lat: INITIAL_LATITUDE,
    lng: INITIAL_LONGITUDE,
  });
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      setFetchError(false);
      
      // 1. Usar a variável de ambiente importada através do Vite
      const API_URL = import.meta.env.VITE_API_URL;

      fetch(API_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setSensorData({
            date: data.Timestamp ? data.Timestamp.split(" ")[0] : "N/A",
            time: data.Timestamp ? data.Timestamp.split(" ")[1] : "N/A",
            speedKPH: parseFloat(data.Velocidade_KPH || 0).toFixed(1),
            rpm: parseInt(data.RPM || 0),
            batteryVoltage: parseFloat(data.Voltagem_bateria || 0),
            batteryPercentage: parseInt(data.Porcentagem_bateria || 0),
            windSpeed: parseInt(data.Velocidade_vento || 0),
            temp: parseInt(data.Temperatura || 0),
            heading: parseInt(data.heading || 0),
            lat: parseFloat(data.lat || 51.505),
            lng: parseFloat(data.lng || -0.09),
          });
        })
        .catch((err) => {
          console.error("Falha ao buscar dados do sensor:", err);
          setFetchError(true);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SensorDataContext.Provider value={{ sensorData, fetchError }}>
      {children}
    </SensorDataContext.Provider>
  );
};

// Hook personalizado para facilitar o uso do contexto
export const useSensorData = () => {
  return useContext(SensorDataContext);
};