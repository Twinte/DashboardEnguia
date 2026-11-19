// src/components/PowerPage.jsx
import { useTranslation } from 'react-i18next';
import {
  FaBolt,
  FaTemperatureHigh,
  FaRegClock,
  FaChargingStation,
  FaHeartbeat,
  FaLayerGroup,
  FaBroadcastTower,
  FaClock,
  FaCog,
  FaPlug
} from 'react-icons/fa';
import { IoBarChart } from "react-icons/io5";
import { useSensorData } from '../context/SensorDataContext';
import { useSettings } from '../context/SettingsContext'; // Import Settings Context
import { renderSensorValue } from '../utils/formatters';
import './PowerPage.css';

const alarmColumns = ['source', 'severity', 'code', 'time', 'acknowledgement'];

const PowerPage = () => {
  const { t } = useTranslation();
  const { sensorData, isLoading, isUsingCachedData } = useSensorData();
  const { energyMode } = useSettings();

  const percentage = sensorData?.batteryPercentage || 0;
  const voltage = sensorData?.batteryVoltage || 0;
  const temperature = sensorData?.temp || 0;
  const currentDraw = sensorData?.currentDraw || 0;
  const timeRemaining = sensorData?.batteryTimeRemaining || 0;
  const batteryHealth = sensorData?.batteryHealth || "Good";

  // Determine colors based on status
  const getStatusColor = (val, type) => {
    if (type === 'temp') return val > 45 ? '#E74C3C' : '#00A3FF';
    if (type === 'batt') return val < 20 ? '#E74C3C' : '#2ECC71';
    return '#FFFFFF';
  };

  const batteryColor = getStatusColor(percentage, 'batt');
  const communicationStatus = isUsingCachedData
    ? 'cached'
    : isLoading ? 'waiting' : 'receiving';

  const { powerDiagnostics, alarmEvents } = sensorData ?? {};
  const { simulated, boosterAvailable, operationalHealthy, auxiliaryVoltage } = powerDiagnostics ?? {};
  const diagnosticText = (key) => t(`power_diagnostics.${key}`);
  const alarmText = (key, value) => t(`power_alarms.${key}_${value}`, { defaultValue: value });
  const diagnosticCards = [
    {
      label: 'booster_availability', icon: FaClock,
      value: diagnosticText(boosterAvailable == null ? 'pending' : boosterAvailable ? 'available' : 'unavailable'),
    },
    {
      label: 'operational_state', icon: FaCog,
      value: diagnosticText(operationalHealthy == null ? 'pending' : operationalHealthy ? 'healthy' : 'problems'),
    },
    {
      label: 'auxiliary_power', icon: FaPlug,
      value: auxiliaryVoltage == null ? diagnosticText('voltage_unavailable') : `${renderSensorValue(auxiliaryVoltage, '', 1)} V`,
    },
    { label: 'communication', icon: FaBroadcastTower, value: diagnosticText(communicationStatus) },
  ];

  return (
    <div className="power-container">
      <section className="power-diagnostics" aria-labelledby="power-diagnostics-title">
        <h2 className="power-section-title" id="power-diagnostics-title">
          {diagnosticText('title')}{simulated && ` · ${diagnosticText('simulated')}`}
        </h2>
        <div className="power-diagnostics-grid">
          {diagnosticCards.map(({ label, icon: Icon, value }) => (
            <div className="power-diagnostic-card" key={label}>
              <Icon aria-hidden="true" />
              <div>
                <h3>{t(`power_diagnostics.${label}`)}</h3>
                <p>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- LEFT PANEL: ELECTRICAL & HEALTH --- */}
      <div className="power-side-panel left">

        {/* 1. Voltage */}
        <div className="hud-card">
          <FaBolt className="hud-card-icon" />
          <div className="hud-card-info">
            <span className="hud-label">{t('voltage')}</span>
            <div className="hud-value">
              {renderSensorValue(voltage, '', 1)}
              <span className="hud-unit">V</span>
            </div>
          </div>
        </div>

        {/* 2. Current Draw */}
        <div className="hud-card">
          <IoBarChart className="hud-card-icon" />
          <div className="hud-card-info">
            <span className="hud-label">{t('current_draw')}</span>
            <div className="hud-value">
              {renderSensorValue(currentDraw, '', 1)}
              <span className="hud-unit">A</span>
            </div>
          </div>
        </div>

        <div className="hud-card">
          <FaHeartbeat className="hud-card-icon" style={{ color: '#2ECC71' }} />
          <div className="hud-card-info">
            <span className="hud-label">{t('state_of_health')}</span>
            <div className="hud-value">
              {t(batteryHealth.toLowerCase().replace(' ', '_')) || batteryHealth}
            </div>
          </div>
        </div>

      </div>

      {/* --- CENTER: POWER CORE --- */}
      <div className="power-core-section">
        <div className="power-ring-container" style={{ '--battery-progress': percentage }}>
          <div className="reactor-ring" style={{ borderTopColor: batteryColor, boxShadow: `0 0 30px ${batteryColor}40` }}></div>
          <div className="reactor-ring-inner"></div>

          <div className="core-value">
            <FaChargingStation className="core-icon" style={{ color: batteryColor }}/>
            <span className={`core-percentage${percentage < 20 ? ' core-percentage--low' : ''}`}>
              {percentage}%
            </span>
            <span className="core-label">ENERGY</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: OPERATIONS & MODE --- */}
      <div className="power-side-panel right">

        {/* 1. Temperature */}
        <div className={`hud-card ${temperature > 45 ? 'danger' : ''}`}>
          <FaTemperatureHigh className="hud-card-icon" style={{ color: getStatusColor(temperature, 'temp') }}/>
          <div className="hud-card-info">
            <span className="hud-label">{t('temperature')}</span>
            <div className="hud-value">
              {renderSensorValue(temperature, '', 0)}
              <span className="hud-unit">°C</span>
            </div>
          </div>
        </div>

        {/* 2. Estimated Time */}
        <div className="hud-card">
          <FaRegClock className="hud-card-icon" />
          <div className="hud-card-info">
            <span className="hud-label">{t('estimated_time_remaining')}</span>
            <div className="hud-value">
              {renderSensorValue(timeRemaining, '', 1)}
              <span className="hud-unit">H</span>
            </div>
          </div>
        </div>

        <div className="hud-card">
          <FaLayerGroup className="hud-card-icon" style={{ color: 'var(--neon-orange)' }} />
          <div className="hud-card-info">
            <span className="hud-label">{t('boat_mode')}</span>
            <div className="hud-value" style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>
              {t(energyMode) || energyMode}
            </div>
          </div>
        </div>

      </div>

      <section className="power-alarms" aria-labelledby="power-alarms-title">
        <h2 className="power-section-title" id="power-alarms-title">
          {t('power_alarms.title')}{simulated && ` · ${diagnosticText('simulated')}`}
        </h2>
        <div className="power-alarms-scroll" role="region" aria-labelledby="power-alarms-title" tabIndex={0}>
          <table aria-labelledby="power-alarms-title">
            <thead>
              <tr>
                {alarmColumns.map((column) => <th key={column} scope="col">{t(`power_alarms.${column}`)}</th>)}
              </tr>
            </thead>
            <tbody>
              {alarmEvents?.length ? alarmEvents.map(({ source, severity, code, time, acknowledged }) => (
                <tr key={`${source}:${code}:${time}`}>
                  <td>{alarmText('source', source)}</td>
                  <td>{alarmText('severity', severity)}</td>
                  <td>{code}</td>
                  <td>{time}</td>
                  <td>{acknowledged == null ? '—' : t(acknowledged ? 'power_alarms.acknowledged' : 'power_alarms.unacknowledged')}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={alarmColumns.length}>{t(alarmEvents ? 'power_alarms.empty' : 'power_alarms.pending')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default PowerPage;
