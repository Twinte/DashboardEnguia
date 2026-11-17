import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SensorDataProvider, useSensorData } from '../../src/context/SensorDataContext';

const success = (data = {}) => ({ ok: true, json: async () => data });

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const mount = () => renderHook(useSensorData, { wrapper: SensorDataProvider });
const settle = () => act(async () => {});

describe('Sensor recovery', () => {
  it('preserves zero coordinates and fractional readings', async () => {
    fetch.mockResolvedValue(success({ lat: 0, lng: 0, Velocidade_KPH: 0, Porcentagem_bateria: 15.5, wifi_connected: false }));
    const { result } = mount();
    await settle();
    expect(result.current.sensorData).toMatchObject({ lat: 0, lng: 0, speedKPH: '0.0', batteryPercentage: 15.5, wifiConnected: false });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(2500));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('stops after five retries and allows a manual recovery', async () => {
    fetch.mockRejectedValue(new Error('Offline'));
    const { result } = mount();
    await settle();
    expect(fetch).toHaveBeenCalledTimes(1);
    for (let attempt = 1; attempt <= 5; attempt++) {
      await act(() => vi.runOnlyPendingTimersAsync());
      expect(result.current.retryCount).toBe(attempt);
      expect(fetch).toHaveBeenCalledTimes(attempt + 1);
    }
    expect(result.current.isRetrying).toBe(false);
    await act(() => vi.advanceTimersByTimeAsync(120000));
    expect(fetch).toHaveBeenCalledTimes(6);
    fetch.mockResolvedValue(success({ RPM: 1234 }));
    await act(async () => result.current.retryNow());
    expect(result.current.fetchError).toBe(false);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.sensorData.rpm).toBe(1234);
    await act(() => vi.advanceTimersByTimeAsync(2500));
    expect(fetch).toHaveBeenCalledTimes(8);
  });

  it('aborts and ignores a superseded request', async () => {
    let finishFirst;
    fetch.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }))
      .mockResolvedValue(success({ RPM: 200 }));
    const { result, unmount } = mount();
    const firstSignal = fetch.mock.calls[0][1].signal;
    await act(async () => result.current.retryNow());
    expect(firstSignal.aborted).toBe(true);
    await act(async () => finishFirst(success({ RPM: 100 })));
    expect(result.current.sensorData.rpm).toBe(200);
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(120000));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('clears the cached-data indicator when the cache expires', async () => {
    localStorage.setItem('sensor_data_cache', JSON.stringify({ data: { rpm: 100 }, timestamp: Date.now() - 299000 }));
    fetch.mockRejectedValue(new Error('Offline'));
    const { result } = mount();
    await settle();
    expect(result.current.isUsingCachedData).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(result.current.isUsingCachedData).toBe(false);
  });
});
