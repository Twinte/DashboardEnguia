import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBatteryHalf, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { GiPathDistance } from 'react-icons/gi';
import { MdHome, MdMoreHoriz, MdPowerSettingsNew, MdSettings, MdWifi, MdWifiOff } from 'react-icons/md';
import AlertsDisplay from './components/AlertsDisplay';
import SystemStatusDrawer from './components/SystemStatusDrawer';
import { useAlerts } from './context/AlertContext';
import { useSensorData } from './context/SensorDataContext';
import { useSettings } from './context/SettingsContext';
import { useTrip } from './context/TripContext';
import { formatTime } from './utils/formatters';
import './App.css';

const HomePage = lazy(() => import('./components/HomePage'));
const PowerPage = lazy(() => import('./components/PowerPage'));
const NavigationMap = lazy(() => import('./components/NavigationMap'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));

const PageLoader = () => <div className="page-loader" role="status"><div className="loading-spinner" /><span>Loading…</span></div>;

function App() {
  const { t } = useTranslation();
  const { sensorData, fetchError, isLoading, isUsingCachedData, isRetrying, retryCount, retryNow } = useSensorData();
  const { addAlert, removeAlert } = useAlerts();
  const { mqttConnectionStatus } = useTrip();
  const { energyMode } = useSettings();
  const [statusOpen, setStatusOpen] = useState(false);
  const closeStatus = useCallback(() => setStatusOpen(false), []);

  useEffect(() => {
    if (!fetchError && sensorData.temp > 45) addAlert('high_temp', t('high_temp_warning'), 'danger');
    else removeAlert('high_temp');
    if (!fetchError && sensorData.batteryPercentage < 20) addAlert('low_battery', t('low_battery_warning'), 'warning');
    else removeAlert('low_battery');
  }, [sensorData.temp, sensorData.batteryPercentage, fetchError, addAlert, removeAlert, t]);

  const isOnline = Boolean(sensorData.wifiConnected);

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <div className="top-bar__identity"><span className="brand-mark">E</span><span>ENGUIA</span></div>
        <time className="top-bar__time">{formatTime(sensorData.time)}</time>
        <button className="system-summary" onClick={() => setStatusOpen(true)} aria-haspopup="dialog" aria-expanded={statusOpen}>
          <span className={`system-summary__connection ${isOnline ? 'is-online' : 'is-offline'}`}>
            {isOnline ? <MdWifi /> : <MdWifiOff />}<span>{isOnline ? t('wifi_connected') : t('wifi_disconnected')}</span>
          </span>
          <span className="system-summary__battery"><FaBatteryHalf /><strong>{sensorData.batteryPercentage ?? 0}%</strong></span>
          {(fetchError || isUsingCachedData) && <FaExclamationTriangle className="system-summary__alert" aria-label={t('sensor_data_unavailable')} />}
          <MdMoreHoriz aria-hidden="true" />
        </button>
        <AlertsDisplay />
      </header>

      <main className="main-dash">
        {fetchError && !isUsingCachedData ? (
          <section className="fetch-error-message" role="alert">
            <FaExclamationTriangle size={34} />
            <h1>{t('sensor_data_unavailable')}</h1>
            {isRetrying && <p><FaSync className="spinning" /> {t('retrying')} ({retryCount}/5)</p>}
            <button onClick={retryNow} className="btn btn-primary" disabled={isRetrying}><FaSync /> {t('retry_now')}</button>
          </section>
        ) : (
          <>
            {isUsingCachedData && <div className="cached-banner">{t('using_cached_data_banner')} <button onClick={retryNow} disabled={isRetrying}>{t('retry_now')}</button></div>}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/power" element={<PowerPage />} />
                <Route path="/route" element={<NavigationMap />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><MdHome /><span>{t('home_tab')}</span></NavLink>
        <NavLink to="/power" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><MdPowerSettingsNew /><span>{t('power_tab')}</span></NavLink>
        <NavLink to="/route" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><GiPathDistance /><span>{t('rout_tab')}</span></NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><MdSettings /><span>{t('settings_tab')}</span></NavLink>
      </nav>

      <SystemStatusDrawer open={statusOpen} onClose={closeStatus} sensorData={sensorData} mqttStatus={mqttConnectionStatus} energyMode={energyMode} isUsingCachedData={isUsingCachedData} />
      {isLoading && <span className="sr-only" role="status">Loading sensor data</span>}
    </div>
  );
}

export default App;
