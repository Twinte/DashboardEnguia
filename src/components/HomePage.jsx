import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBatteryHalf, FaCaretDown, FaCaretUp, FaCompass, FaRoute, FaTemperatureHalf, FaWind } from 'react-icons/fa6';
import { GiBoatPropeller } from 'react-icons/gi';
import { useSensorData } from '../context/SensorDataContext';
import { useTrip } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import MetricCard from './MetricCard';
import PrimaryGauge from './PrimaryGauge';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const { sensorData, isLoading } = useSensorData();
  const { addToast } = useToast();
  const { isTripActive, distanceTraveled, courseToSteer, waypoints } = useTrip();
  const [trimPosition, setTrimPosition] = useState(Number(sensorData.trimBow) || 0);
  const [isAdjustingTrim, setIsAdjustingTrim] = useState(false);

  useEffect(() => setTrimPosition(Number(sensorData.trimBow) || 0), [sensorData.trimBow]);

  const values = useMemo(() => ({
    speed: Number.parseFloat(sensorData.speedKPH) || 0,
    rpm: Number.parseInt(sensorData.rpm, 10) || 0,
    battery: Number(sensorData.batteryPercentage) || 0,
    temperature: Number(sensorData.temp) || 0,
    wind: Number(sensorData.windSpeed) || 0,
    heading: Number(isTripActive ? courseToSteer : sensorData.heading) || 0,
    range: Number(sensorData.batteryTimeRemaining) || 0,
  }), [sensorData, isTripActive, courseToSteer]);

  const handleTrimAdjust = useCallback(async (direction) => {
    setIsAdjustingTrim(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/latest_data';
      const baseUrl = apiUrl.replace('/api/latest_data', '');
      const response = await fetch(`${baseUrl}/api/trim`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success || !Number.isFinite(data.trim_bow)) throw new Error('Invalid trim response');
      setTrimPosition(data.trim_bow);
    } catch (error) {
      console.error('Failed to adjust trim:', error);
      addToast(t('trim_adjust_failed'), 'error');
    } finally {
      setIsAdjustingTrim(false);
    }
  }, [addToast, t]);

  if (isLoading) {
    return <div className="loading-screen" role="status"><div className="loading-spinner" />{t('loading', 'System initializing')}</div>;
  }

  const batteryTone = values.battery < 20 ? 'danger' : values.battery < 40 ? 'warning' : 'success';
  const temperatureTone = values.temperature > 50 ? 'danger' : 'default';

  return (
    <section className="home-dashboard" aria-label={t('home_tab')}>
      <header className="home-dashboard__intro">
        <div>
          <span className="eyebrow">ENGUIA</span>
          <h1>{isTripActive ? t('mission_active') : t('home_tab')}</h1>
        </div>
        <span className={`connection-badge ${sensorData.wifiConnected ? 'is-online' : 'is-offline'}`}>
          <span aria-hidden="true" />{sensorData.wifiConnected ? t('wifi_connected') : t('wifi_disconnected')}
        </span>
      </header>

      <div className="home-dashboard__grid">
        <PrimaryGauge label={t('speed', 'Speed')} value={values.speed} max={130} unit="KPH" helper={t('current_speed', 'Current speed')} />

        <section className="navigation-summary surface-card" aria-labelledby="navigation-summary-title">
          <div className="navigation-summary__heading">
            <div><span className="eyebrow">{isTripActive ? t('mission_active') : t('route_planner')}</span><h2 id="navigation-summary-title">{Math.round(values.heading)}°</h2></div>
            <FaCompass aria-hidden="true" />
          </div>
          <div className="compass-track" aria-label={`${t('heading')}: ${Math.round(values.heading)} degrees`}>
            <span>N</span><span>NE</span><span>E</span><span>SE</span><span>S</span>
            <i style={{ left: `${(values.heading / 360) * 100}%` }} />
          </div>
          <div className="navigation-summary__stats">
            <div><span>{t('total_dist')}</span><strong>{distanceTraveled.toFixed(1)} km</strong></div>
            <div><span>{t('waypoint')}</span><strong>{waypoints.length}</strong></div>
            <div><span>{t('battery_percentage')}</span><strong>{values.battery}%</strong></div>
          </div>
        </section>

        <PrimaryGauge label={t('battery_percentage')} value={values.battery} max={100} unit="%" tone={batteryTone} helper={`${values.range.toFixed(1)} h ${t('estimated_time_remaining').toLowerCase()}`} />

        <MetricCard icon={<GiBoatPropeller />} label="RPM" value={values.rpm} unit="RPM" />
        <MetricCard icon={<FaWind />} label={t('wind_speed')} value={values.wind} unit="KTS" />
        <MetricCard icon={<FaTemperatureHalf />} label={t('temperature')} value={values.temperature} unit="°C" tone={temperatureTone} />
        <MetricCard icon={<FaBatteryHalf />} label={t('estimated_time_remaining')} value={values.range.toFixed(1)} unit="H" tone={batteryTone} />

        <section className="trim-control surface-card" aria-labelledby="trim-title">
          <div className="trim-control__heading"><div><span className="eyebrow">CONTROL</span><h2 id="trim-title">BOW TRIM</h2></div><strong>{trimPosition > 0 ? `+${trimPosition}` : trimPosition}</strong></div>
          <div className="trim-control__track" aria-hidden="true"><span style={{ left: `${((trimPosition + 5) / 10) * 100}%` }} /></div>
          <div className="trim-control__scale" aria-hidden="true"><span>-5</span><span>0</span><span>+5</span></div>
          <div className="trim-control__actions">
            <button onClick={() => handleTrimAdjust('up')} disabled={isAdjustingTrim || trimPosition <= -5} aria-label="Trim bow up"><FaCaretUp /> Up</button>
            <button onClick={() => handleTrimAdjust('down')} disabled={isAdjustingTrim || trimPosition >= 5} aria-label="Trim bow down"><FaCaretDown /> Down</button>
          </div>
        </section>

        <MetricCard className="route-card" icon={<FaRoute />} label={t('route_planner')} value={isTripActive ? t('mission_active') : `${waypoints.length} ${t('waypoint')}`} helper={`${Math.round(values.heading)}° ${t('heading')}`} tone="accent" />
      </div>
    </section>
  );
};

export default HomePage;
