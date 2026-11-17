// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

/**
 * @typedef {Object} ToastItem
 * @property {number} id - Unique toast identifier.
 * @property {string} message - Toast message text.
 * @property {'success'|'error'|'info'} type - Toast type.
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {Function} addToast - Function to add a new toast.
 * @property {Function} removeToast - Function to remove a toast by ID.
 */

/**
 * Individual toast notification component.
 * @param {Object} props - Component props.
 * @param {string} props.message - Toast message.
 * @param {'success'|'error'|'info'} props.type - Toast type.
 * @param {Function} props.onDismiss - Function to dismiss the toast.
 * @returns {JSX.Element} Toast element.
 */
const Toast = ({ message, type, onDismiss }) => {
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    info: <FaInfoCircle />,
  };

  return (
    <div className={`toast toast-${type}`} onClick={onDismiss}>
      <div className="toast-icon">{icons[type] || <FaInfoCircle />}</div>
      <p className="toast-message">{message}</p>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  onDismiss: PropTypes.func.isRequired,
};

/**
 * Container component that renders all active toasts.
 * @param {Object} props - Component props.
 * @param {ToastItem[]} props.toasts - Array of toast items to display.
 * @param {Function} props.removeToast - Function to remove a toast.
 * @returns {JSX.Element|null} Toast container or null if no toasts.
 */
const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'info']),
    })
  ).isRequired,
  removeToast: PropTypes.func.isRequired,
};

/**
 * React context for toast notifications.
 * @type {React.Context<ToastContextValue|null>}
 */
const ToastContext = createContext(null);

/**
 * Provider component that manages toast notifications.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} Provider component.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((toastId) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== toastId));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    const newToast = { id, message, type };
    setToasts(prevToasts => [newToast, ...prevToasts]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access toast functions from the context.
 * @throws {Error} If used outside of ToastProvider.
 * @returns {ToastContextValue} Toast context value.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
