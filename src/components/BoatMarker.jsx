// src/components/BoatMarker.jsx
import React from 'react';
import { Marker } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaLocationArrow } from 'react-icons/fa';
import L from 'leaflet';

const BoatMarker = ({ position, heading }) => {
  // Cria um ícone customizado usando HTML e o rotaciona
  const iconMarkup = renderToStaticMarkup(
    <div style={{ transform: `rotate(${heading}deg)` }}>
      <FaLocationArrow />
    </div>
  );

  const customMarkerIcon = L.divIcon({
    html: iconMarkup,
    className: 'boat-marker-icon', // Classe para estilização
    iconSize: [24, 24],
  });

  return <Marker position={position} icon={customMarkerIcon} />;
};

export default BoatMarker;