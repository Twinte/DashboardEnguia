// src/utils/formatters.js

/**
 * Renders a sensor value with optional unit and decimal places.
 * @param {*} value - The sensor value to format.
 * @param {string} [unit=''] - The unit to append (e.g., 'V', 'A', 'km/h').
 * @param {number|null} [fixed=null] - Number of decimal places (null to skip).
 * @param {boolean} [error=false] - Whether there's an error with this sensor.
 * @returns {string} Formatted value or 'N/A' if invalid.
 */
export const renderSensorValue = (value, unit = '', fixed = null, error = false) => {
  if (error || value === undefined || value === null || value === "N/A") return 'N/A';

  if (typeof value === 'number' && fixed !== null) {
      return `${value.toFixed(fixed)}${unit}`;
  }

  return `${value}${unit}`;
};

/**
 * Formats a time string from HH:MM:SS to HH:MM.
 * @param {string|null|undefined} timeString - Time string in HH:MM:SS format.
 * @returns {string} Formatted time (HH:MM) or 'N/A' if invalid.
 */
export const formatTime = (timeString) => {
  if (!timeString || timeString === "N/A") return "N/A";

  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }

  return timeString;
};

/**
 * Formats a date string.
 * @param {string|null|undefined} dateString - Date string to format.
 * @returns {string} Date string or 'N/A' if invalid.
 */
export const formatDate = (dateString) => {
  if (!dateString || dateString === "N/A") return "N/A";
  return dateString;
};
