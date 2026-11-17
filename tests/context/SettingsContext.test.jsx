// tests/context/SettingsContext.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../../src/context/SettingsContext';

const TestConsumer = () => {
  const { theme, language, energyMode, changeTheme, changeLanguage, changeEnergyMode } = useSettings();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="language">{language}</span>
      <span data-testid="energy-mode">{energyMode}</span>
      <button data-testid="change-theme" onClick={() => changeTheme('light')}>Change Theme</button>
      <button data-testid="change-language" onClick={() => changeLanguage('pt')}>Change Language</button>
      <button data-testid="change-energy" onClick={() => changeEnergyMode('eco')}>Change Energy</button>
    </div>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should use default theme when no localStorage value exists', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('should use stored theme from localStorage', async () => {
      localStorage.setItem('theme', 'light');

      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });

    it('should use default language when no localStorage value exists', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('en');
      });
    });

    it('should use default energy mode when no localStorage value exists', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('energy-mode')).toHaveTextContent('balanced');
      });
    });

    it('should use stored energy mode from localStorage', async () => {
      localStorage.setItem('energyMode', 'eco');

      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('energy-mode')).toHaveTextContent('eco');
      });
    });
  });

  describe('Theme Change', () => {
    it('should update theme when changeTheme is called', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      const button = screen.getByTestId('change-theme');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });

    it('should persist theme to localStorage', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      const button = screen.getByTestId('change-theme');
      fireEvent.click(button);

      await waitFor(() => {
        expect(localStorage.getItem('theme')).toBe('light');
      });
    });
  });

  describe('Language Change', () => {
    it('should update language when changeLanguage is called', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      const button = screen.getByTestId('change-language');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('language')).toHaveTextContent('pt');
      });
    });

    it('should persist language to localStorage', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      const button = screen.getByTestId('change-language');
      fireEvent.click(button);

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('pt');
      });
    });
  });

  describe('Energy Mode Change', () => {
    it('should update energy mode when changeEnergyMode is called', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      const button = screen.getByTestId('change-energy');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('energy-mode')).toHaveTextContent('eco');
      });
    });

    it('should persist energy mode to localStorage', async () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      const button = screen.getByTestId('change-energy');
      fireEvent.click(button);

      await waitFor(() => {
        expect(localStorage.getItem('energyMode')).toBe('eco');
      });
    });
  });

  describe('Context Provider', () => {
    it('should throw error when useSettings is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSettings');

      consoleError.mockRestore();
    });
  });
});
