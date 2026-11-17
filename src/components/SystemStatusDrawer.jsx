import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaBatteryHalf, FaBolt, FaDatabase, FaLeaf, FaTemperatureHigh, FaTimes } from 'react-icons/fa';
import { MdCloud, MdWifi } from 'react-icons/md';

const SystemStatusDrawer = ({ open, onClose, sensorData, mqttStatus, energyMode, isUsingCachedData }) => {
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
