// tests/unit/formatters.test.js
import { describe, it, expect } from 'vitest';
import { renderSensorValue, formatTime, formatDate } from '../../src/utils/formatters';

describe('renderSensorValue', () => {
  it('should return formatted string with unit and fixed decimals', () => {
    expect(renderSensorValue(50.567, 'V', 1)).toBe('50.6V');
  });

  it('should return formatted string with unit without fixed decimals', () => {
    expect(renderSensorValue(50, 'KPH')).toBe('50KPH');
  });

  it('should return N/A when error flag is true', () => {
    expect(renderSensorValue(50, 'V', 1, true)).toBe('N/A');
  });

  it('should return N/A when value is undefined', () => {
    expect(renderSensorValue(undefined, 'V', 1)).toBe('N/A');
  });

  it('should return N/A when value is null', () => {
    expect(renderSensorValue(null, 'V', 1)).toBe('N/A');
  });

  it('should return N/A when value is "N/A" string', () => {
    expect(renderSensorValue('N/A', 'V', 1)).toBe('N/A');
  });

  it('should handle zero value correctly', () => {
    expect(renderSensorValue(0, 'V', 1)).toBe('0.0V');
  });

  it('should return unit when value is empty string', () => {
    // Empty string returns just the unit (edge case)
    expect(renderSensorValue('', 'V', 1)).toBe('V');
  });
});

describe('formatTime', () => {
  it('should format HH:MM:SS to HH:MM', () => {
    expect(formatTime('14:30:45')).toBe('14:30');
  });

  it('should handle time without seconds', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });

  it('should return N/A for empty string', () => {
    expect(formatTime('')).toBe('N/A');
  });

  it('should return N/A for null', () => {
    expect(formatTime(null)).toBe('N/A');
  });

  it('should return N/A for undefined', () => {
    expect(formatTime(undefined)).toBe('N/A');
  });

  it('should return N/A for "N/A" string', () => {
    expect(formatTime('N/A')).toBe('N/A');
  });

  it('should return original string for invalid format', () => {
    expect(formatTime('invalid')).toBe('invalid');
  });
});

describe('formatDate', () => {
  it('should return date string as-is', () => {
    expect(formatDate('2024-01-15')).toBe('2024-01-15');
  });

  it('should return N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A');
  });

  it('should return N/A for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should return N/A for undefined', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('should return N/A for "N/A" string', () => {
    expect(formatDate('N/A')).toBe('N/A');
  });
});
