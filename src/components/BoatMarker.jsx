// src/components/BoatMarker.jsx
import { memo } from 'react';
import PropTypes from 'prop-types';
import { Marker } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaLocationArrow } from 'react-icons/fa';
import L from 'leaflet';

const BoatMarker = memo(({ position, heading }) => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{ transform: `rotate(${heading}deg)` }}>
      <FaLocationArrow />
    </div>
  );

  const customMarkerIcon = L.divIcon({
    html: iconMarkup,
    className: 'boat-marker-icon',
    iconSize: [24, 24],
  });

  return <Marker position={position} icon={customMarkerIcon} />;
});

BoatMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  heading: PropTypes.number.isRequired,
};

BoatMarker.displayName = 'BoatMarker';

export default BoatMarker;
