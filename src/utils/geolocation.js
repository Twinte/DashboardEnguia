// src/utils/geolocation.js

/**
 * Calcula a distância em quilômetros entre duas coordenadas geográficas usando a fórmula de Haversine.
 * @param {number} lat1 - Latitude do ponto 1.
 * @param {number} lng1 - Longitude do ponto 1.
 * @param {number} lat2 - Latitude do ponto 2.
 * @param {number} lng2 - Longitude do ponto 2.
 * @returns {number} A distância em km.
 */
export const getDistance = (lat1, lng1, lat2, lng2) => {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return 0;
  }
  
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em km
  return distance;
};