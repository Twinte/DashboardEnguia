import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MQTTProvider, useMQTT } from '../../src/context/MQTTContext';

const { clients, addToast } = vi.hoisted(() => ({ clients: [], addToast: vi.fn() }));
vi.mock('../../src/context/ToastContext', () => ({ useToast: () => ({ addToast }) }));
vi.mock('paho-mqtt', () => ({ default: {
  Client: vi.fn(function () {
    this.connected = false;
    this.connect = vi.fn(options => { this.options = options; });
    this.isConnected = () => this.connected;
    this.disconnect = vi.fn(() => { this.connected = false; });
    this.send = vi.fn();
    clients.push(this);
  }),
  Message: vi.fn(function (payload) { this.payloadString = payload; }),
} }));

beforeEach(() => {
  vi.useFakeTimers();
  clients.length = 0;
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const mount = () => renderHook(useMQTT, { wrapper: MQTTProvider });
const succeed = client => act(() => { client.connected = true; client.options.onSuccess(); });

describe('MQTT recovery', () => {
  it('caps failed connection retries and supports restarting recovery', async () => {
    const { result } = mount();
    act(() => result.current.connect());
    for (let attempt = 0; attempt <= 10; attempt++) {
      expect(result.current.reconnectAttempt).toBe(attempt);
      act(() => clients[attempt].options.onFailure({ errorCode: 1 }));
      await act(() => vi.runOnlyPendingTimersAsync());
    }
    expect(clients).toHaveLength(11);
    expect(result.current.connectionStatus).toBe('error');
    act(() => result.current.reconnect());
    expect(clients).toHaveLength(12);
    succeed(clients[11]);
    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it('publishes through the current client and recovers a lost connection', async () => {
    const { result, rerender } = mount();
    act(() => result.current.connect());
    const client = clients[0];
    succeed(client);
    const publish = result.current.publish;
    rerender();
    expect(result.current.publish).toBe(publish);
    act(() => result.current.publish('boats/test', { rpm: 100 }));
    expect(client.send).toHaveBeenCalledWith(expect.objectContaining({ destinationName: 'boats/test', payloadString: '{"rpm":100}' }));
    act(() => { client.connected = false; client.onConnectionLost({ errorCode: 1 }); });
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(clients).toHaveLength(2);
    succeed(clients[1]);
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('cancels scheduled retries on disconnect', async () => {
    const { result } = mount();
    act(() => result.current.connect());
    act(() => clients[0].options.onFailure({ errorCode: 1 }));
    act(() => result.current.disconnect());
    await act(() => vi.advanceTimersByTimeAsync(120000));
    expect(clients).toHaveLength(1);
    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('ignores late connection callbacks after disconnect and unmount', () => {
    const { result, unmount } = mount();
    act(() => result.current.connect());
    const client = clients[0];
    act(() => result.current.disconnect());
    succeed(client);
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(client.connected).toBe(false);
    act(() => result.current.connect());
    const pending = clients[1];
    unmount();
    succeed(pending);
    expect(pending.connected).toBe(false);
  });
});
