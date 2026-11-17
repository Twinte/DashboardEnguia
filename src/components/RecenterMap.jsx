// src/components/RecenterMap.jsx
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

RecenterMap.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
};

export default RecenterMap;
