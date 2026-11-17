// src/context/SettingsContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import i18n from '../i18n';

/**
 * @typedef {Object} SettingsContextValue
 * @property {string} theme - Current theme ('light' or 'dark').
 * @property {Function} changeTheme - Function to change theme.
 * @property {string} language - Current language code (e.g., 'en', 'pt').
 * @property {Function} changeLanguage - Function to change language.
 * @property {string} energyMode - Current energy mode ('balanced', 'eco', 'performance').
 * @property {Function} changeEnergyMode - Function to change energy mode.
 * @property {number} batteryThreshold - Battery percentage threshold for alerts.
 * @property {Function} changeBatteryThreshold - Function to change battery threshold.
 * @property {number} lowBatteryAlert - Low battery alert threshold.
 * @property {Function} changeLowBatteryAlert - Function to change low battery alert.
 * @property {number} highTempAlert - High temperature alert threshold.
 * @property {Function} changeHighTempAlert - Function to change high temp alert.
 * @property {boolean} autopilotMode - Autopilot mode enabled.
 * @property {Function} changeAutopilotMode - Function to change autopilot mode.
 * @property {string} routePlanning - Route planning preference.
 * @property {Function} changeRoutePlanning - Function to change route planning.
 * @property {string} compassCalibration - Compass calibration mode.
 * @property {Function} changeCompassCalibration - Function to change compass calibration.
 * @property {boolean} twoFactorAuth - Two-factor authentication enabled.
 * @property {Function} changeTwoFactorAuth - Function to change 2FA setting.
 * @property {boolean} loginNotifications - Login notifications enabled.
 * @property {Function} changeLoginNotifications - Function to change login notifications.
 */

/**
 * React context for application settings (theme, language, energy mode).
 * @type {React.Context<SettingsContextValue|null>}
 */
const SettingsContext = createContext();

// Helper to safely get localStorage values
const getStoredValue = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// 2. Criar o Provedor (Provider)

/**
 * Provider component that manages application settings.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} Provider component.
 */
export const SettingsProvider = ({ children }) => {
  // Tenta ler as preferências guardadas no localStorage ou usa padrões
  const initialTheme = localStorage.getItem('theme') || 'dark';
  const initialLanguage = localStorage.getItem('language') || i18n.language || 'en';
  // NOVO: Ler o modo de energia guardado ou usar 'balanced' como padrão
  const initialEnergyMode = localStorage.getItem('energyMode') || 'balanced';

  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);
  // NOVO: Criar estado para o modo de energia
  const [energyMode, setEnergyMode] = useState(initialEnergyMode);

  // Additional settings with persistence
  const [batteryThreshold, setBatteryThreshold] = useState(() =>
    getStoredValue('batteryThreshold', 20)
  );
  const [lowBatteryAlert, setLowBatteryAlert] = useState(() =>
    getStoredValue('lowBatteryAlert', 15)
  );
  const [highTempAlert, setHighTempAlert] = useState(() =>
    getStoredValue('highTempAlert', 60)
  );
  const [autopilotMode, setAutopilotMode] = useState(() =>
    getStoredValue('autopilotMode', false)
  );
  const [routePlanning, setRoutePlanning] = useState(() =>
    getStoredValue('routePlanning', 'default')
  );
  const [compassCalibration, setCompassCalibration] = useState(() =>
    getStoredValue('compassCalibration', 'auto')
  );
  const [twoFactorAuth, setTwoFactorAuth] = useState(() =>
    getStoredValue('twoFactorAuth', true)
  );
  const [loginNotifications, setLoginNotifications] = useState(() =>
    getStoredValue('loginNotifications', false)
  );


  // Efeito para aplicar a classe do tema ao body e guardar no localStorage
  useEffect(() => {
    document.body.classList.remove('light', 'dark'); // Remove classes antigas
    document.body.classList.add(theme); // Adiciona a classe atual
    localStorage.setItem('theme', theme); // Guarda no localStorage
  }, [theme]);

  // Efeito para mudar o idioma no i18next e guardar no localStorage
  useEffect(() => {
    i18n.changeLanguage(language); // Muda o idioma globalmente
    localStorage.setItem('language', language); // Guarda no localStorage
  }, [language]);

  // NOVO: Efeito para guardar o modo de energia no localStorage
  useEffect(() => {
    localStorage.setItem('energyMode', energyMode);
  }, [energyMode]);

  // Persist additional settings
  useEffect(() => {
    localStorage.setItem('batteryThreshold', JSON.stringify(batteryThreshold));
  }, [batteryThreshold]);

  useEffect(() => {
    localStorage.setItem('lowBatteryAlert', JSON.stringify(lowBatteryAlert));
  }, [lowBatteryAlert]);

  useEffect(() => {
    localStorage.setItem('highTempAlert', JSON.stringify(highTempAlert));
  }, [highTempAlert]);

  useEffect(() => {
    localStorage.setItem('autopilotMode', JSON.stringify(autopilotMode));
  }, [autopilotMode]);

  useEffect(() => {
    localStorage.setItem('routePlanning', JSON.stringify(routePlanning));
  }, [routePlanning]);

  useEffect(() => {
    localStorage.setItem('compassCalibration', JSON.stringify(compassCalibration));
  }, [compassCalibration]);

  useEffect(() => {
    localStorage.setItem('twoFactorAuth', JSON.stringify(twoFactorAuth));
  }, [twoFactorAuth]);

  useEffect(() => {
    localStorage.setItem('loginNotifications', JSON.stringify(loginNotifications));
  }, [loginNotifications]);


  // Funções para mudar o estado
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // NOVO: Função para alterar o modo de energia
  const changeEnergyMode = (newMode) => {
    setEnergyMode(newMode);
  };

  const changeBatteryThreshold = (value) => {
    setBatteryThreshold(Number(value));
  };

  const changeLowBatteryAlert = (value) => {
    setLowBatteryAlert(Number(value));
  };

  const changeHighTempAlert = (value) => {
    setHighTempAlert(Number(value));
  };

  const changeAutopilotMode = (value) => {
    setAutopilotMode(Boolean(value));
  };

  const changeRoutePlanning = (value) => {
    setRoutePlanning(value);
  };

  const changeCompassCalibration = (value) => {
    setCompassCalibration(value);
  };

  const changeTwoFactorAuth = (value) => {
    setTwoFactorAuth(Boolean(value));
  };

  const changeLoginNotifications = (value) => {
    setLoginNotifications(Boolean(value));
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        changeTheme,
        language,
        changeLanguage,
        energyMode,
        changeEnergyMode,
        batteryThreshold,
        changeBatteryThreshold,
        lowBatteryAlert,
        changeLowBatteryAlert,
        highTempAlert,
        changeHighTempAlert,
        autopilotMode,
        changeAutopilotMode,
        routePlanning,
        changeRoutePlanning,
        compassCalibration,
        changeCompassCalibration,
        twoFactorAuth,
        changeTwoFactorAuth,
        loginNotifications,
        changeLoginNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access settings from the context.
 * @throws {Error} If used outside of SettingsProvider.
 * @returns {SettingsContextValue} Settings context value.
 */
export const useSettings = () => {
  return useContext(SettingsContext);
};
