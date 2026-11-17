// tests/context/SensorDataContext.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SensorDataProvider, useSensorData } from '../../src/context/SensorDataContext';
import React from 'react';

// Mock environment variable
vi.mock('import.meta.env', () => ({
  VITE_API_URL: 'http://localhost:8000/api/latest_data',
}));

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};
vi.stubGlobal('navigator', {
  geolocation: mockGeolocation,
});

const mockSensorData = {
  Timestamp: '2024-01-15 10:30:00',
  Velocidade_KPH: '45.2',
  RPM: 3200,
  Voltagem_bateria: '336.5',
  Porcentagem_bateria: 78,
  Velocidade_vento: 12,
  Temperatura: 32,
  Corrente_A: 15.2,
  heading: 275,
  lat: -1.4559,
  lng: -48.5037,
  wifi_connected: true,
  battery_time_remaining: 4.5,
  battery_health: 'Good',
  trim_bow: 2,
};

const TestConsumer = ({ onContextValue }) => {
  const contextValue = useSensorData();

  React.useEffect(() => {
    if (onContextValue) {
      onContextValue(contextValue);
    }
  }, [contextValue, onContextValue]);

  return (
    <div>
      <span data-testid="loading">{contextValue.isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="error">{contextValue.fetchError ? 'error' : 'no-error'}</span>
      <span data-testid="cached">{contextValue.isUsingCachedData ? 'cached' : 'fresh'}</span>
      <span data-testid="speed">{contextValue.sensorData.speedKPH}</span>
      <span data-testid="battery">{contextValue.sensorData.batteryPercentage}</span>
      <span data-testid="wifi">{contextValue.sensorData.wifiConnected ? 'connected' : 'disconnected'}</span>
      <span data-testid="time-remaining">{contextValue.sensorData.batteryTimeRemaining}</span>
      <span data-testid="health">{contextValue.sensorData.batteryHealth}</span>
    </div>
  );
};

describe('SensorDataContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return default values when no cache exists', async () => {
      globalThis.fetch = vi.fn().mockImplementation(() =>
        new Promise(() => {}) // Never resolves - simulates slow network
      );

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      // Should show loading initially
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      });

      // Default values
      expect(screen.getByTestId('speed')).toHaveTextContent('0');
      expect(screen.getByTestId('battery')).toHaveTextContent('0');
    });

    it('should load cached data from localStorage', async () => {
      const cachedData = {
        speedKPH: '45.0',
        batteryPercentage: 80,
        batteryTimeRemaining: 5.0,
        batteryHealth: 'Good',
      };

      localStorage.setItem('sensor_data_cache', JSON.stringify({
        data: cachedData,
        timestamp: Date.now(),
      }));

      globalThis.fetch = vi.fn().mockImplementation(() =>
        new Promise(() => {}) // Never resolves
      );

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('speed')).toHaveTextContent('45.0');
        expect(screen.getByTestId('battery')).toHaveTextContent('80');
      });
    });
  });

  describe('Successful Fetch', () => {
    it('should update sensor data on successful API response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSensorData),
      });

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('speed')).toHaveTextContent('45.2');
        expect(screen.getByTestId('battery')).toHaveTextContent('78');
        expect(screen.getByTestId('wifi')).toHaveTextContent('connected');
        expect(screen.getByTestId('time-remaining')).toHaveTextContent('4.5');
        expect(screen.getByTestId('health')).toHaveTextContent('Good');
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      });
    });

    it('should save data to cache on successful fetch', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSensorData),
      });

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      await waitFor(() => {
        const cached = localStorage.getItem('sensor_data_cache');
        expect(cached).toBeTruthy();
      });
    });
  });

  describe('Fetch Error Handling', () => {
    it('should set fetchError on API failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('error');
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });
    });

    it('should show cached data when API fails and cache exists', async () => {
      const cachedData = {
        speedKPH: '30.0',
        batteryPercentage: 50,
      };

      localStorage.setItem('sensor_data_cache', JSON.stringify({
        data: cachedData,
        timestamp: Date.now(),
      }));

      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('speed')).toHaveTextContent('30.0');
        expect(screen.getByTestId('cached')).toHaveTextContent('cached');
      });
    });

    it('should use default data when API fails and no cache', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <SensorDataProvider>
          <TestConsumer />
        </SensorDataProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('speed')).toHaveTextContent('0');
        expect(screen.getByTestId('battery')).toHaveTextContent('0');
      });
    });
  });

  describe('Context Provider', () => {
    it('should throw error when useSensorData is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSensorData must be used within a SensorDataProvider');

      consoleError.mockRestore();
    });
  });
});
