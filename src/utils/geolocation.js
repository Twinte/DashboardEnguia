// src/utils/geolocation.js

/**
 * @typedef {Object} Coordinate
 * @property {number} lat - Latitude in decimal degrees.
 * @property {number} lng - Longitude in decimal degrees.
 */

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @param {number|null} lat1 - Latitude of point 1 in decimal degrees.
 * @param {number|null} lng1 - Longitude of point 1 in decimal degrees.
 * @param {number|null} lat2 - Latitude of point 2 in decimal degrees.
 * @param {number|null} lng2 - Longitude of point 2 in decimal degrees.
 * @returns {number} Distance in kilometers. Returns 0 if any coordinate is null/undefined.
 */
export const getDistance = (lat1, lng1, lat2, lng2) => {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return 0;
  }

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

/**
 * Converts degrees to radians.
 * @param {number} deg - Angle in degrees.
 * @returns {number} Angle in radians.
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param {number} rad - Angle in radians.
 * @returns {number} Angle in degrees.
 */
function toDeg(rad) {
  return rad * (180 / Math.PI);
}

/**
 * Calculates the initial bearing (forward azimuth) from point 1 to point 2.
 * @param {number|null} lat1 - Latitude of point 1 in decimal degrees.
 * @param {number|null} lng1 - Longitude of point 1 in decimal degrees.
 * @param {number|null} lat2 - Latitude of point 2 in decimal degrees.
 * @param {number|null} lng2 - Longitude of point 2 in decimal degrees.
 * @returns {number} Bearing in degrees (0-360). Returns 0 if any coordinate is null/undefined.
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

  // Normalize to 0-360 degrees
  return (brng + 360) % 360;
};
