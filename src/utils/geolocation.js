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

/**
 * Converte graus para radianos
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Converte radianos para graus
 */
function toDeg(rad) {
  return rad * (180 / Math.PI);
}

/**
 * Calcula o rumo inicial (bearing) em graus de um ponto 1 para um ponto 2.
 * @param {number} lat1 - Latitude do ponto 1.
 * @param {number} lng1 - Longitude do ponto 1.
 * @param {number} lat2 - Latitude do ponto 2.
 * @param {number} lng2 - Longitude do ponto 2.
 * @returns {number} O rumo em graus (0-360).
 */
export const getBearing = (lat1, lng1, lat2, lng2) => {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return 0;
  }

  const φ1 = toRad(lat1);
  const λ1 = toRad(lng1);
  const φ2 = toRad(lat2);
  const λ2 = toRad(lng2);
  const Δλ = λ2 - λ1;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  let brng = toDeg(Math.atan2(y, x));
  
  // Normaliza o resultado para 0-360 graus
  return (brng + 360) % 360;
};