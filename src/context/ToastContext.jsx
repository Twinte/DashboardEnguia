// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

// Componente para renderizar um único Toast
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

// Componente para renderizar o container de todos os Toasts
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

const ToastContext = createContext(null);

let id = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const newToast = { id: id++, message, type };
    setToasts(prevToasts => [newToast, ...prevToasts]); // Adiciona no início da lista

    // Remove o toast automaticamente após 5 segundos
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook para facilitar o uso
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};