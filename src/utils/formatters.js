// src/utils/formatters.js

/**
 * Renderiza um valor de sensor, tratando casos de erro ou valores nulos.
 * @param {any} value - O valor do sensor.
 * @param {string} unit - A unidade de medida a ser anexada.
 * @param {number|null} fixed - O número de casas decimais para arredondar.
 * @returns {string} O valor formatado ou 'N/A'.
 */
export const renderSensorValue = (value, unit = '', fixed = null, error = false) => {
  if (error || value === undefined || value === null || value === "N/A") return 'N/A';
  
  if (typeof value === 'number' && fixed !== null) {
      return `${value.toFixed(fixed)}${unit}`;
  }
  
  return `${value}${unit}`;
}