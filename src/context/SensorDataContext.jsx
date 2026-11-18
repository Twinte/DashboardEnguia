// src/context/SensorDataContext.jsx
import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} SensorData
 * @property {string} date - Current date string.
 * @property {string} time - Current time string.
 * @property {number|string} speedKPH - Speed in kilometers per hour.
 * @property {number} rpm - Engine RPM.
 * @property {number} batteryVoltage - Battery voltage in volts.
 * @property {number} batteryPercentage - Battery charge percentage (0-100).
 * @property {number} windSpeed - Wind speed.
 * @property {number} temp - Temperature reading.
 * @property {number} heading - Compass heading in degrees.
 * @property {number} lat - Current latitude.
 * @property {number} lng - Current longitude.
 * @property {number} currentDraw - Current draw in amps.
 * @property {boolean} wifiConnected - WiFi connection status.
 * @property {number} batteryTimeRemaining - Estimated battery time remaining in hours.
 * @property {string} batteryHealth - Battery health status (e.g., "Good").
 * @property {number} trimBow - Bow trim position.
 */

/**
 * @typedef {Object} SensorDataContextValue
 * @property {SensorData} sensorData - Current sensor data.
 * @property {boolean} fetchError - Whether there was an error fetching data.
 * @property {boolean} isLoading - Whether data is initially loading.
 * @property {boolean} isUsingCachedData - Whether displaying cached data.
 * @property {number} retryCount - Number of retry attempts made.
 * @property {boolean} isRetrying - Whether currently retrying after error.
 * @property {Function} retryNow - Function to manually trigger retry.
 */

const INITIAL_LATITUDE = -1.4558;
const INITIAL_LONGITUDE = -48.5036;
const CACHE_KEY = 'sensor_data_cache';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;

/**
 * React context for sensor data from boat sensors.
 * @type {React.Context<SensorDataContextValue|null>}
 */
const SensorDataContext = createContext();

/**
 * Returns initial sensor data with default values.
 * @returns {SensorData} Initial sensor data object.
 */
const getInitialSensorData = () => {
  // Try to detect initial network status
  const getNetworkStatus = () => {
    if (typeof navigator !== 'undefined') {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        return connection.type === 'wifi' && navigator.onLine;
      }
      return navigator.onLine;
    }
    return true;
  };

  return {
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
    currentDraw: 0,
    wifiConnected: getNetworkStatus(),
    batteryTimeRemaining: 0,
    batteryHealth: "Good",
    trimBow: 0,
  };
};

const loadCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < 5 * 60 * 1000) {
        console.log('Loaded cached sensor data (age: ' + Math.round(age / 1000) + 's)');
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached data:', error);
  }
  return null;
};

const saveCachedData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('Failed to cache sensor data:', error);
  }
};

/**
 * Provider component that manages sensor data state and fetching.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} Provider component.
 */
export const SensorDataProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState(() => {
    const cached = loadCachedData();
    return { ...getInitialSensorData(), ...cached };
  });
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retryActionRef = useRef(() => {});
  const retryNow = useCallback(() => retryActionRef.current(), []);

  useEffect(() => {
    let disposed = false;
    let timer;
    let activeController;

    const fetchData = async (attempt = 0) => {
      clearTimeout(timer);
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;
      const timeout = setTimeout(() => controller.abort(), 5000);
      const isCurrent = () => !disposed && activeController === controller;

      try {
        const response = await fetch(import.meta.env.VITE_API_URL || '/api/latest_data', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Invalid sensor response');
        }
        if (!isCurrent()) return;

        const newData = getInitialSensorData();
        const numericFields = {
          Velocidade_KPH: 'speedKPH', RPM: 'rpm', Voltagem_bateria: 'batteryVoltage',
          Porcentagem_bateria: 'batteryPercentage', Velocidade_vento: 'windSpeed',
          Temperatura: 'temp', heading: 'heading', lat: 'lat', lng: 'lng',
          Corrente_A: 'currentDraw', battery_time_remaining: 'batteryTimeRemaining',
          trim_bow: 'trimBow',
        };
        for (const [source, target] of Object.entries(numericFields)) {
          if (data[source] != null && data[source] !== '' && Number.isFinite(Number(data[source]))) {
            newData[target] = Number(data[source]);
          }
        }
        newData.speedKPH = newData.speedKPH.toFixed(1);
        if (typeof data.Timestamp === 'string') {
          [newData.date, newData.time = 'N/A'] = data.Timestamp.split(' ');
        }
        if (data.wifi_connected != null) newData.wifiConnected = Boolean(data.wifi_connected);
        if (typeof data.battery_health === 'string') newData.batteryHealth = data.battery_health;
        const diagnostics = data.power_diagnostics;
        if (diagnostics && typeof diagnostics === 'object' && !Array.isArray(diagnostics)) {
          newData.powerDiagnostics = {
            simulated: diagnostics.simulated === true,
            emergencyStopActive: typeof diagnostics.emergency_stop_active === 'boolean'
              ? diagnostics.emergency_stop_active : null,
            interlocksSatisfied: typeof diagnostics.interlocks_satisfied === 'boolean'
              ? diagnostics.interlocks_satisfied : null,
            auxiliaryVoltage: Number.isFinite(diagnostics.auxiliary_voltage)
              ? diagnostics.auxiliary_voltage : null,
          };
        }
        const electrical = data.electrical_diagnostics;
        if (electrical && typeof electrical === 'object' && !Array.isArray(electrical)) {
          newData.electricalDiagnostics = electrical;
        }
        if (Array.isArray(data.alarm_events)) {
          newData.alarmEvents = data.alarm_events.filter((event) =>
            event && ['source', 'severity', 'code', 'time'].every((field) => typeof event[field] === 'string')
          );
        }

        setSensorData(newData);
        saveCachedData(newData);
        setFetchError(false);
        setIsUsingCachedData(false);
        setRetryCount(0);
        setIsRetrying(false);
        timer = setTimeout(() => fetchData(), 2500);
      } catch (error) {
        if (!isCurrent()) return;
        console.error('Failed to fetch sensor data:', error);
        const cached = loadCachedData();
        if (cached) setSensorData({ ...getInitialSensorData(), ...cached });
        setIsUsingCachedData(Boolean(cached));
        setFetchError(true);
        setRetryCount(attempt);
        setIsRetrying(attempt < MAX_RETRIES);
        if (attempt < MAX_RETRIES) {
          const delay = Math.min(INITIAL_RETRY_DELAY * 2 ** attempt, MAX_RETRY_DELAY) + Math.random() * 1000;
          timer = setTimeout(() => fetchData(attempt + 1), delay);
        }
      } finally {
        clearTimeout(timeout);
        if (isCurrent()) setIsLoading(false);
      }
    };

    retryActionRef.current = () => {
      setRetryCount(0);
      setIsRetrying(false);
      fetchData();
    };
    fetchData();
    return () => {
      disposed = true;
      clearTimeout(timer);
      activeController?.abort();
      retryActionRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        if (!disposed) setSensorData(data => ({ ...data, lat: coords.latitude, lng: coords.longitude }));
      },
      error => console.warn('Could not get user geolocation:', error.message),
    );
    return () => { disposed = true; };
  }, []);

  // Monitor network status changes using Network Information API
  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      // Try to get more detailed connection info if available
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const isWifi = connection ? connection.type === 'wifi' : isOnline;

      setSensorData(prev => ({
        ...prev,
        wifiConnected: isOnline && isWifi,
      }));
    };

    // Initial check
    updateNetworkStatus();

    // Listen for online/offline events
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection change events (more detailed)
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return (
    <SensorDataContext.Provider value={{
      sensorData,
      fetchError,
      isLoading,
      isUsingCachedData,
      retryCount,
      isRetrying,
      retryNow,
    }}>
      {children}
    </SensorDataContext.Provider>
  );
};

SensorDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access sensor data from the context.
 * @throws {Error} If used outside of SensorDataProvider.
 * @returns {SensorDataContextValue} Sensor data context value.
 */
export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};
