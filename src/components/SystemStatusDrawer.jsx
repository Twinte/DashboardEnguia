import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FaBatteryHalf, FaBolt, FaDatabase, FaLeaf, FaPlug, FaTemperatureHigh, FaTimes } from 'react-icons/fa';
import { MdCloud, MdWifi } from 'react-icons/md';

const electricalCards = [
  { title: 'port', port: 'P1', icon: FaPlug, readings: ['port_readings', 'port_limit'] },
  { title: 'port', port: 'P2', icon: FaPlug, readings: ['port_readings', 'port_limit'] },
  { title: 'port', port: 'P3', icon: FaPlug, readings: ['port_readings', 'port_limit'] },
  { title: 'bms', icon: FaBatteryHalf, readings: ['cell_voltage', 'cell_temperature'] },
  { title: 'supercapacitors', icon: FaBolt, readings: ['usable_energy', 'balancing'] },
  { title: 'converter', icon: FaPlug, readings: ['precharge', 'ccs2_charging'] },
];

const SystemStatusDrawer = ({ open, onClose, sensorData, mqttStatus, energyMode, isUsingCachedData }) => {
  const { t, i18n } = useTranslation();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const rows = [
    { icon: <FaBatteryHalf />, label: 'Battery', value: `${sensorData.batteryPercentage ?? 0}% · ${sensorData.batteryVoltage ?? 0} V` },
    { icon: <FaTemperatureHigh />, label: 'Temperature', value: `${sensorData.temp ?? 0} °C` },
    { icon: <MdWifi />, label: 'Wi-Fi', value: sensorData.wifiConnected ? 'Connected' : 'Disconnected' },
    { icon: <MdCloud />, label: 'Telemetry', value: mqttStatus || 'inactive' },
    { icon: <FaLeaf />, label: 'Energy mode', value: energyMode },
    { icon: <FaBolt />, label: 'Current draw', value: `${sensorData.currentDraw ?? 0} A` },
  ];

  const electrical = sensorData.electricalDiagnostics;
  const number = (value, digits = 1) => Number.isFinite(value)
    ? value.toLocaleString(i18n.resolvedLanguage, { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '—';
  const state = (value, enabled, disabled) => typeof value === 'boolean'
    ? t(`status_electrical.${value ? enabled : disabled}`)
    : t('status_electrical.pending');
  const getReadings = (port) => {
    const supply = electrical?.ports?.[port];
    const { bms, supercapacitors, converter } = electrical ?? {};
    return {
      voltage: number(supply?.voltage),
      current: number(supply?.current),
      power: number(supply?.power_kw, 3),
      limit: number(supply?.limit_kw),
      cellMin: number(bms?.cell_min, 2),
      cellMax: number(bms?.cell_max, 2),
      tempMin: number(bms?.temp_min),
      tempMax: number(bms?.temp_max),
      energy: number(supercapacitors?.energy_pct),
      balancing: state(supercapacitors?.balancing, 'active', 'inactive'),
      precharge: state(converter?.precharge_complete, 'complete', 'incomplete'),
      contactors: state(converter?.contactors_closed, 'closed', 'open'),
      charging: state(converter?.ccs2_charging, 'active', 'inactive'),
    };
  };

  return (
    <div className="status-drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="status-drawer" role="dialog" aria-modal="true" aria-labelledby="system-status-title">
        <header>
          <div>
            <span className="eyebrow">ENGUIA</span>
            <h2 id="system-status-title">System status</h2>
          </div>
          <button ref={closeButtonRef} className="icon-button" onClick={onClose} aria-label="Close system status">
            <FaTimes />
          </button>
        </header>
        {isUsingCachedData && <div className="status-notice"><FaDatabase /> Showing cached sensor data</div>}
        <div className="status-list">
          {rows.map((row) => (
            <div className="status-row" key={row.label}>
              <span className="status-row__icon" aria-hidden="true">{row.icon}</span>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
        <section className="status-electrical-grid" aria-labelledby="status-electrical-title">
          <h3 id="status-electrical-title">
            {t('status_electrical.section')}{electrical?.simulated === true && ` · ${t('power_diagnostics.simulated')}`}
          </h3>
          {electricalCards.map(({ title, port, icon: Icon, readings }) => (
            <div className="status-electrical-card" key={port ?? title}>
              <Icon aria-hidden="true" />
              <div>
                <h4>{t(`status_electrical.${title}`, { port })}</h4>
                {readings.map((reading) => <p key={reading}>{t(`status_electrical.${reading}`, getReadings(port))}</p>)}
              </div>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
};

SystemStatusDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sensorData: PropTypes.object.isRequired,
  mqttStatus: PropTypes.string,
  energyMode: PropTypes.string.isRequired,
  isUsingCachedData: PropTypes.bool.isRequired,
};

export default SystemStatusDrawer;
