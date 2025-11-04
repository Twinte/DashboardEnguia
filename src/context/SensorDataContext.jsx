// src/context/SensorDataContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// Coordenadas padrão (fallback) - Belém, PA
const INITIAL_LATITUDE = -1.4558;
const INITIAL_LONGITUDE = -48.5036;

const SensorDataContext = createContext();

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
    currentDraw: 0, // NOVO: Adicionado estado inicial para corrente
  });
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento inicial

  useEffect(() => {
    // Tenta obter a geolocalização do utilizador para a posição inicial do mapa.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Atualiza apenas a posição inicial, mantendo os outros dados como estão.
          setSensorData(prevData => ({
            ...prevData,
            lat: latitude,
            lng: longitude,
          }));
        },
        (err) => {
          console.warn("Não foi possível obter a geolocalização do utilizador:", err.message);
        }
      );
    } else {
        console.warn("API de Geolocalização não suportada neste navegador.");
    }

    // Inicia o loop para buscar os dados da API do barco.
    const fetchData = () => {
      const API_URL = import.meta.env.VITE_API_URL;

      fetch(API_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setFetchError(false); // Resetar o erro em caso de sucesso
          // Usa uma função de atualização para mesclar os dados novos com os existentes.
          setSensorData(prevData => ({
            ...prevData, // Mantém os dados antigos (como a lat/lng do utilizador)
            ...(data.Timestamp && { date: data.Timestamp.split(" ")[0], time: data.Timestamp.split(" ")[1] }),
            ...(data.Velocidade_KPH && { speedKPH: parseFloat(data.Velocidade_KPH).toFixed(1) }),
            ...(data.RPM && { rpm: parseInt(data.RPM) }),
            ...(data.Voltagem_bateria && { batteryVoltage: parseFloat(data.Voltagem_bateria) }),
            ...(data.Porcentagem_bateria && { batteryPercentage: parseInt(data.Porcentagem_bateria) }),
            ...(data.Velocidade_vento && { windSpeed: parseInt(data.Velocidade_vento) }),
            ...(data.Temperatura && { temp: parseInt(data.Temperatura) }),
            ...(data.heading && { heading: parseInt(data.heading) }),
            // Se a API enviar lat/lng, eles sobrepõem a localização do utilizador.
            ...(data.lat && { lat: parseFloat(data.lat) }),
            ...(data.lng && { lng: parseFloat(data.lng) }),
            
            // NOVO: Ler o dado de Corrente da API
            ...(data.Corrente_A && { currentDraw: parseFloat(data.Corrente_A) }),
          }));
          // Desativa o 'isLoading' apenas após a primeira busca bem-sucedida
          if (isLoading) setIsLoading(false);
        })
        .catch((err) => {
          console.error("Falha ao buscar dados do sensor:", err);
          setFetchError(true);
          // Também desativa o 'isLoading' em caso de erro para não ficar a carregar para sempre
          if (isLoading) setIsLoading(false);
        });
    };

    fetchData(); // Busca imediatamente na primeira vez
    const intervalId = setInterval(fetchData, 2500); // E continua a cada 2.5 segundos

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, [isLoading]); // Adicionado 'isLoading' às dependências para que o estado seja gerido corretamente

  return (
    <SensorDataContext.Provider value={{ sensorData, fetchError, isLoading }}>
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};