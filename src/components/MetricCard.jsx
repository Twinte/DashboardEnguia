import PropTypes from 'prop-types';

const MetricCard = ({ icon, label, value, unit = '', tone = 'default', helper, className = '' }) => (
  <article className={`metric-card metric-card--${tone} ${className}`.trim()}>
    <div className="metric-card__header">
      {icon && <span className="metric-card__icon" aria-hidden="true">{icon}</span>}
      <span className="metric-card__label">{label}</span>
    </div>
    <div className="metric-card__reading">
      <strong>{value}</strong>
      {unit && <span>{unit}</span>}
    </div>
    {helper && <span className="metric-card__helper">{helper}</span>}
  </article>
);

MetricCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  tone: PropTypes.oneOf(['default', 'accent', 'success', 'warning', 'danger']),
  helper: PropTypes.string,
  className: PropTypes.string,
};

export default MetricCard;
