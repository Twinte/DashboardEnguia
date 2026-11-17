// tests/context/ToastContext.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../../src/context/ToastContext';

const TestConsumer = () => {
  const { addToast } = useToast();

  return (
    <div>
      <button data-testid="add-success" onClick={() => addToast('Success message', 'success')}>
        Add Success
      </button>
      <button data-testid="add-error" onClick={() => addToast('Error message', 'error')}>
        Add Error
      </button>
      <button data-testid="add-info" onClick={() => addToast('Info message', 'info')}>
        Add Info
      </button>
      <button data-testid="add-default" onClick={() => addToast('Default message')}>
        Add Default
      </button>
    </div>
  );
};

describe('ToastContext', () => {
  describe('Add Toast', () => {
    it('should add success toast', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      const button = screen.getByTestId('add-success');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should add error toast', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      const button = screen.getByTestId('add-error');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should add info toast', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      const button = screen.getByTestId('add-info');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should add toast with default type (info)', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      const button = screen.getByTestId('add-default');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Default message')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should add multiple toasts', async () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      const addSuccess = screen.getByTestId('add-success');
      const addError = screen.getByTestId('add-error');

      fireEvent.click(addSuccess);
      fireEvent.click(addError);

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Context Provider', () => {
    it('should throw error when useToast is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useToast must be used within a ToastProvider');

      consoleError.mockRestore();
    });
  });
});
