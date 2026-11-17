// src/context/MQTTContext.jsx
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Paho from 'paho-mqtt';
import { useToast } from './ToastContext';

/**
 * @typedef {Object} MQTTContextValue
 * @property {Object|null} client - Paho MQTT client instance.
 * @property {'connected'|'disconnected'|'connecting'|'error'} connectionStatus - MQTT connection status.
 * @property {number} reconnectAttempt - Number of reconnection attempts made.
 * @property {Function} connect - Function to connect to MQTT broker.
 * @property {Function} disconnect - Function to disconnect from MQTT broker.
 * @property {Function} publish - Function to publish a message to a topic.
 * @property {Function} subscribe - Function to subscribe to a topic.
 * @property {Function} unsubscribe - Function to unsubscribe from a topic.
 */

/**
 * React context for MQTT messaging.
 * @type {React.Context<MQTTContextValue|null>}
 */
const MQTTContext = createContext();

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 60000;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Provider component that manages MQTT connection.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} Provider component.
 */
export const MQTTProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const { addToast } = useToast();
  const clientRef = useRef(null);
  const clientIdRef = useRef(`electric_boat_dashboard_${Math.random().toString(16).slice(2, 10)}`);
  const reconnectTimeoutRef = useRef(null);
  const isManualDisconnectRef = useRef(false);
  const isMountedRef = useRef(true);

  const brokerHost = import.meta.env.VITE_MQTT_HOST || 'broker.hivemq.com';
  const brokerPort = parseInt(import.meta.env.VITE_MQTT_PORT, 10) || 8884;
  const useSSL = import.meta.env.VITE_MQTT_USE_SSL !== 'false';

  const clearReconnectTimeout = useCallback(() => {
    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
  }, []);

  const closeClient = useCallback(() => {
    const previous = clientRef.current;
    clientRef.current = null;
    if (previous) {
      previous.onConnectionLost = () => {};
      try {
        previous.disconnect();
      } catch {
        // A failed connection may already have closed its socket.
      }
    }
  }, []);

  const connectAttempt = useCallback(function attemptConnection(attempt = 0) {
    if (!isMountedRef.current || isManualDisconnectRef.current) return;
    clearReconnectTimeout();
    closeClient();
    setReconnectAttempt(attempt);
    setConnectionStatus('connecting');

    let newClient;
    const isCurrent = () => isMountedRef.current && !isManualDisconnectRef.current && clientRef.current === newClient;
    const scheduleRetry = () => {
      if (!isCurrent()) return;
      setConnectionStatus('error');
      if (attempt < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(INITIAL_RECONNECT_DELAY * 2 ** attempt, MAX_RECONNECT_DELAY) + Math.random() * 1000;
        clearReconnectTimeout();
        reconnectTimeoutRef.current = setTimeout(() => attemptConnection(attempt + 1), delay);
      } else {
        addToast('MQTT: Max reconnection attempts reached.', 'error');
      }
    };

    try {
      newClient = new Paho.Client(brokerHost, brokerPort, clientIdRef.current);
      clientRef.current = newClient;
      newClient.onConnectionLost = (response) => {
        if (!isCurrent()) return;
        setConnectionStatus('disconnected');
        if (response.errorCode !== 0) {
          addToast('MQTT connection lost. Reconnecting...', 'error');
          // A previously established connection starts a fresh recovery cycle.
          reconnectTimeoutRef.current = setTimeout(() => attemptConnection(0), INITIAL_RECONNECT_DELAY);
        }
      };
      newClient.connect({
        onSuccess: () => {
          if (!isCurrent()) {
            try { newClient.disconnect(); } catch { /* Already closed. */ }
            return;
          }
          setConnectionStatus('connected');
          setReconnectAttempt(0);
          clearReconnectTimeout();
          addToast('MQTT connection established!', 'success');
        },
        onFailure: scheduleRetry,
        useSSL,
        timeout: 10,
        keepAliveInterval: 30,
        cleanSession: true,
      });
    } catch (error) {
      console.error('MQTT: Error creating client:', error);
      // Constructor errors have no client instance to track.
      if (!newClient) clientRef.current = newClient;
      scheduleRetry();
    }
  }, [brokerHost, brokerPort, useSSL, addToast, clearReconnectTimeout, closeClient]);

  const connect = useCallback(() => {
    if (clientRef.current || reconnectTimeoutRef.current) return;
    isManualDisconnectRef.current = false;
    connectAttempt();
  }, [connectAttempt]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearReconnectTimeout();
    closeClient();
    setReconnectAttempt(0);
    setConnectionStatus('disconnected');
  }, [clearReconnectTimeout, closeClient]);

  const reconnect = useCallback(() => {
    disconnect();
    isManualDisconnectRef.current = false;
    connectAttempt();
  }, [disconnect, connectAttempt]);

  const publish = useCallback((topic, payload) => {
    if (!clientRef.current?.isConnected()) return;
    try {
      const message = new Paho.Message(JSON.stringify(payload));
      message.destinationName = topic;
      message.qos = 1;
      clientRef.current.send(message);
    } catch (error) {
      console.error('MQTT: Error publishing message:', error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isManualDisconnectRef.current = true;
      clearReconnectTimeout();
      closeClient();
    };
  }, [clearReconnectTimeout, closeClient]);

  const value = {
    connectionStatus,
    connect,
    disconnect,
    reconnect,
    publish,
    reconnectAttempt,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
  };

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};

MQTTProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access MQTT functions from the context.
 * @returns {MQTTContextValue} MQTT context value.
 */
export const useMQTT = () => {
  return useContext(MQTTContext);
};
