import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TripProvider, useTrip } from '../../src/context/TripContext';

const { mqtt, sensorData, addToast } = vi.hoisted(() => ({
  mqtt: { connectionStatus: 'disconnected', connect: vi.fn(), disconnect: vi.fn(), publish: vi.fn() },
  sensorData: { lat: -1.4558, lng: -48.5036, heading: 0 },
  addToast: vi.fn(),
}));
vi.mock('../../src/context/MQTTContext', () => ({ useMQTT: () => mqtt }));
vi.mock('../../src/context/SensorDataContext', () => ({ useSensorData: () => ({ sensorData }) }));
vi.mock('../../src/context/ToastContext', () => ({ useToast: () => ({ addToast }) }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mqtt.connectionStatus = 'disconnected';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ isWater: true }) }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const mount = () => renderHook(useTrip, { wrapper: TripProvider });
const plan = result => act(async () => result.current.addWaypoint({ id: 1, lat: -1.5, lng: -48.6 }));

describe('Trip telemetry lifecycle', () => {
  it('publishes the start event after MQTT connects and resumes telemetry after reconnect', async () => {
    const { result, rerender } = mount();
    await plan(result);
    act(() => result.current.startTrip());
    expect(mqtt.publish).not.toHaveBeenCalled();
    mqtt.connectionStatus = 'connected';
    rerender();
    expect(mqtt.publish).toHaveBeenCalledWith('boats/barco-01/trip/status', expect.objectContaining({ status: 'started', tripId: result.current.tripId }));
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(mqtt.publish).toHaveBeenCalledWith('boats/barco-01/telemetry/live', expect.any(Object));
    mqtt.connectionStatus = 'disconnected';
    rerender();
    mqtt.publish.mockClear();
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(mqtt.publish).not.toHaveBeenCalled();
    mqtt.connectionStatus = 'connected';
    rerender();
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(mqtt.publish).toHaveBeenCalledTimes(1);
    expect(mqtt.publish).toHaveBeenCalledWith('boats/barco-01/telemetry/live', expect.any(Object));
  });

  it('does not disconnect a new trip because the previous trip ended recently', async () => {
    const { result } = mount();
    await plan(result);
    act(() => result.current.startTrip());
    act(() => result.current.endTrip());
    act(() => result.current.startTrip());
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(mqtt.disconnect).not.toHaveBeenCalled();
    expect(result.current.isTripActive).toBe(true);
  });
});
