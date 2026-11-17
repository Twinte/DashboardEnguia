// src/components/YachtGauge.jsx
import { useMemo, memo } from 'react';
import PropTypes from 'prop-types';

const YachtGauge = memo(function YachtGauge({
  value = 0,
  maxValue = 100,
  unit = '',
  label = '',
  size = 280,
  tickCount = 14,
  colorStops = [
    { offset: 0, color: '#2ECC71' },
    { offset: 0.5, color: '#F1C40F' },
    { offset: 0.75, color: '#E67E22' },
    { offset: 1, color: '#E74C3C' }
  ],
  showInnerRing = true,
}) {
  const centerX = size / 2;
  const centerY = size * 0.45;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.32;
  const tickOuterRadius = size * 0.44;
  const tickInnerRadius = size * 0.38;
  const labelRadius = size * 0.30;

  const startAngle = 225;
  const endAngle = -45;
  const sweepAngle = 270;

  const ticks = useMemo(() => {
    const items = [];
    const step = maxValue / tickCount;

    for (let i = 0; i <= tickCount; i++) {
      const tickValue = Math.round(i * step);
      const angle = startAngle - (i / tickCount) * sweepAngle;
      const radians = (angle * Math.PI) / 180;

      const x1 = centerX + Math.cos(radians) * tickInnerRadius;
      const y1 = centerY - Math.sin(radians) * tickInnerRadius;
      const x2 = centerX + Math.cos(radians) * tickOuterRadius;
      const y2 = centerY - Math.sin(radians) * tickOuterRadius;

      const labelX = centerX + Math.cos(radians) * labelRadius;
      const labelY = centerY - Math.sin(radians) * labelRadius;

      items.push({
        x1, y1, x2, y2,
        labelX, labelY,
        value: tickValue,
        angle
      });
    }
    return items;
  }, [tickCount, maxValue, centerX, centerY, tickInnerRadius, tickOuterRadius, labelRadius, startAngle, sweepAngle]);

  const normalizedValue = Math.min(Math.max(value, 0), maxValue);
  const needleAngle = startAngle - (normalizedValue / maxValue) * sweepAngle;

  const needleLength = outerRadius * 0.85;

  // Arc path helper
  const describeArc = (cx, cy, radius, startAng, endAng) => {
    const start = {
      x: cx + Math.cos((startAng * Math.PI) / 180) * radius,
      y: cy - Math.sin((startAng * Math.PI) / 180) * radius
    };
    const end = {
      x: cx + Math.cos((endAng * Math.PI) / 180) * radius,
      y: cy - Math.sin((endAng * Math.PI) / 180) * radius
    };
    const largeArcFlag = Math.abs(startAng - endAng) > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const gradientId = `gauge-gradient-${label.replace(/\s/g, '-')}`;
  const glowId = `gauge-glow-${label.replace(/\s/g, '-')}`;

  return (
    <div className="yacht-gauge-container" style={{ width: size, height: size * 0.85 }}>
      <svg
        viewBox={`0 0 ${size} ${size * 0.6}`}
        width="100%"
        height="auto"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient for the arc */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colorStops.map((stop, i) => (
              <stop key={i} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
            ))}
          </linearGradient>

          {/* Glow filter */}
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow for depth */}
          <filter id="gauge-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        {/* Background circle for depth */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius + 15}
          fill="url(#gauge-bg-gradient)"
          style={{ filter: 'url(#gauge-shadow)' }}
        />

        {/* Dark background ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius + 8}
          fill="none"
          stroke="rgba(0, 20, 40, 0.9)"
          strokeWidth="20"
        />

        {/* Inner dark circle */}
        {showInnerRing && (
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 10}
            fill="rgba(5, 11, 20, 0.95)"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        )}

        {/* Main colored arc (background track) */}
        <path
          d={describeArc(centerX, centerY, outerRadius, startAngle, endAngle)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Colored progress arc */}
        <path
          d={describeArc(centerX, centerY, outerRadius, startAngle, needleAngle)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ filter: `url(#${glowId})` }}
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text
              x={tick.labelX}
              y={tick.labelY}
              fill="rgba(255, 255, 255, 0.7)"
              fontSize={size * 0.045}
              fontFamily="'Rajdhani', sans-serif"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Needle */}
        <g style={{
          transform: `rotate(${-needleAngle + 90}deg)`,
          transformOrigin: `${centerX}px ${centerY}px`,
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Needle shadow */}
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - needleLength}
            stroke="rgba(0, 0, 0, 0.5)"
            strokeWidth="6"
            strokeLinecap="round"
            style={{ filter: 'blur(4px)' }}
          />
          {/* Main needle */}
          <line
            x1={centerX}
            y1={centerY + 15}
            x2={centerX}
            y2={centerY - needleLength}
            stroke="#FF9F00"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Needle tip */}
          <circle
            cx={centerX}
            cy={centerY - needleLength + 5}
            r="4"
            fill="#FF9F00"
            style={{ filter: 'drop-shadow(0 0 6px #FF9F00)' }}
          />
        </g>

        {/* Center hub */}
        <circle
          cx={centerX}
          cy={centerY}
          r="18"
          fill="linear-gradient(180deg, #2a3a4b 0%, #0a1520 100%)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="12"
          fill="#0a1520"
          stroke="#FF9F00"
          strokeWidth="2"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="5"
          fill="#FF9F00"
          style={{ filter: 'drop-shadow(0 0 8px #FF9F00)' }}
        />
      </svg>

      {/* Digital value display - positioned below the gauge */}
      <div className="gauge-digital-display">
        <span className="gauge-digital-value">{Math.round(normalizedValue)}</span>
        <span className="gauge-digital-unit">{unit}</span>
      </div>
    </div>
  );
});

YachtGauge.propTypes = {
  value: PropTypes.number,
  maxValue: PropTypes.number,
  unit: PropTypes.string,
  label: PropTypes.string,
  size: PropTypes.number,
  tickCount: PropTypes.number,
  colorStops: PropTypes.arrayOf(
    PropTypes.shape({
      offset: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    })
  ),
  showInnerRing: PropTypes.bool,
};

export default memo(YachtGauge);
