import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '../../src/components/HomePage';

const { sensorData, addToast } = vi.hoisted(() => ({ sensorData: { trimBow: 2 }, addToast: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));
vi.mock('../../src/context/SensorDataContext', () => ({ useSensorData: () => ({ sensorData, isLoading: false }) }));
vi.mock('../../src/context/TripContext', () => ({ useTrip: () => ({ isTripActive: false, distanceTraveled: 0, waypoints: [] }) }));
vi.mock('../../src/context/ToastContext', () => ({ useToast: () => ({ addToast }) }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const trimValue = () => screen.getByRole('heading', { name: 'BOW TRIM' }).parentElement.parentElement.querySelector('strong');

describe('Bow trim confirmation', () => {
  it('preserves the position and reports a failed request', async () => {
    fetch.mockRejectedValue(new Error('Offline'));
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Trim bow down' }));
    await waitFor(() => expect(addToast).toHaveBeenCalledWith('trim_adjust_failed', 'error'));
    expect(trimValue()).toHaveTextContent('+2');
  });

  it('displays only a position confirmed by the API', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, trim_bow: 3 }) });
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Trim bow down' }));
    await waitFor(() => expect(trimValue()).toHaveTextContent('+3'));
    expect(addToast).not.toHaveBeenCalled();
  });
});
