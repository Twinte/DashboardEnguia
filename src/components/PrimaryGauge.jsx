import PropTypes from 'prop-types';

const PrimaryGauge = ({ label, value, max, unit, tone = 'accent', helper }) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const percent = Math.min(100, Math.max(0, (safeValue / max) * 100));

  return (
    <article className={`primary-gauge primary-gauge--${tone}`} aria-label={`${label}: ${safeValue} ${unit}`}>
      <div className="primary-gauge__heading">
        <span>{label}</span>
        {helper && <small>{helper}</small>}
      </div>
      <div className="primary-gauge__dial" style={{ '--gauge-progress': `${percent * 2.7}deg` }}>
        <div className="primary-gauge__inner">
          <strong>{Math.round(safeValue)}</strong>
          <span>{unit}</span>
        </div>
      </div>
      <div className="primary-gauge__scale" aria-hidden="true">
        <span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span>
      </div>
    </article>
  );
};

PrimaryGauge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  max: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['accent', 'success', 'warning', 'danger']),
  helper: PropTypes.string,
};

export default PrimaryGauge;
