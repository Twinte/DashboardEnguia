// tests/unit/geolocation.test.js
import { describe, it, expect } from 'vitest';
import { getDistance, getBearing } from '../../src/utils/geolocation';

describe('getDistance', () => {
  it('should return 0 when lat1 is null', () => {
    expect(getDistance(null, -48.5036, -1.4558, -48.5036)).toBe(0);
  });

  it('should return 0 when lng1 is null', () => {
    expect(getDistance(-1.4558, null, -1.4558, -48.5036)).toBe(0);
  });

  it('should return 0 when lat2 is null', () => {
    expect(getDistance(-1.4558, -48.5036, null, -48.5036)).toBe(0);
  });

  it('should return 0 when lng2 is null', () => {
    expect(getDistance(-1.4558, -48.5036, -1.4558, null)).toBe(0);
  });

  it('should return 0 when all coordinates are null', () => {
    expect(getDistance(null, null, null, null)).toBe(0);
  });

  it('should calculate distance between two known points', () => {
    // Distance from Belém to Mosqueiro (approximately 20km)
    const distance = getDistance(-1.4558, -48.5036, -1.1559, -48.4239);
    expect(distance).toBeGreaterThan(30);
    expect(distance).toBeLessThan(40);
  });

  it('should return 0 for same coordinates', () => {
    const distance = getDistance(-1.4558, -48.5036, -1.4558, -48.5036);
    expect(distance).toBeCloseTo(0, 5);
  });
});

describe('getBearing', () => {
  it('should return 0 when lat1 is null', () => {
    expect(getBearing(null, -48.5036, -1.4558, -48.5036)).toBe(0);
  });

  it('should return 0 when lng1 is null', () => {
    expect(getBearing(-1.4558, null, -1.4558, -48.5036)).toBe(0);
  });

  it('should return 0 when lat2 is null', () => {
    expect(getBearing(-1.4558, -48.5036, null, -48.5036)).toBe(0);
  });

  it('should return 0 when lng2 is null', () => {
    expect(getBearing(-1.4558, -48.5036, -1.4558, null)).toBe(0);
  });

  it('should return 0 when all coordinates are null', () => {
    expect(getBearing(null, null, null, null)).toBe(0);
  });

  it('should return approximately 0 degrees for due North', () => {
    // Same longitude, different latitude (North)
    const bearing = getBearing(-1.0, -48.5, -0.5, -48.5);
    expect(bearing).toBeLessThan(5);
  });

  it('should return approximately 90 degrees for due East', () => {
    // Same latitude, different longitude (East)
    const bearing = getBearing(-1.5, -49.0, -1.5, -48.0);
    expect(bearing).toBeGreaterThan(85);
    expect(bearing).toBeLessThan(95);
  });

  it('should return approximately 180 degrees for due South', () => {
    // Same longitude, different latitude (South)
    const bearing = getBearing(-0.5, -48.5, -1.0, -48.5);
    expect(bearing).toBeGreaterThan(175);
    expect(bearing).toBeLessThan(185);
  });

  it('should return approximately 270 degrees for due West', () => {
    // Same latitude, different longitude (West)
    const bearing = getBearing(-1.5, -48.0, -1.5, -49.0);
    expect(bearing).toBeGreaterThan(265);
    expect(bearing).toBeLessThan(275);
  });

  it('should return valid bearing between two known points', () => {
    // Belém to Mosqueiro
    const bearing = getBearing(-1.4558, -48.5036, -1.1559, -48.4239);
    expect(bearing).toBeGreaterThan(0);
    expect(bearing).toBeLessThan(360);
  });
});
