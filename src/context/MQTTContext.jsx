// src/context/MQTTContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react'; // 1. Importar o useCallback
import Paho from 'paho-mqtt';
import { useToast } from './ToastContext';

const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { addToast } = useToast();

  const brokerHost = 'broker.hivemq.com';
  const brokerPort = 8884;
  const clientId = `electric_boat_dashboard_${Math.random().toString(16).substr(2, 8)}`;

  const connect = () => {
    setConnectionStatus('connecting');
    console.log('MQTT: Conectando...');
    
    try {
      const newClient = new Paho.Client(brokerHost, brokerPort, clientId);
      
      newClient.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
          console.error('MQTT: Conexão perdida:', responseObject.errorMessage);
          setConnectionStatus('error');
          addToast('Conexão MQTT perdida.', 'error');
        }
      };

      newClient.onMessageArrived = (message) => {
        console.log('MQTT: Mensagem recebida:', message.payloadString);
      };

      newClient.connect({
        onSuccess: () => {
          console.log('MQTT: Conectado com sucesso!');
          setClient(newClient);
          setConnectionStatus('connected');
          addToast('Conexão MQTT estabelecida!', 'success');
        },
        onFailure: (err) => {
          console.error('MQTT: Falha ao conectar:', err);
          setConnectionStatus('error');
          addToast('Falha ao conectar ao servidor MQTT.', 'error');
        },
        useSSL: true,
        timeout: 5,
        reconnect: true,
      });

    } catch (error) {
        console.error("MQTT: Erro ao criar cliente.", error);
        setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (client) {
      console.log('MQTT: Desconectando...');
      client.disconnect();
      setClient(null);
      setConnectionStatus('disconnected');
    }
  };

  // 2. Envolver a função 'publish' com useCallback
  const publish = useCallback((topic, payload) => {
    if (client && connectionStatus === 'connected') {
      try {
        const message = new Paho.Message(JSON.stringify(payload));
        message.destinationName = topic;
        message.qos = 1;
        client.send(message);
      } catch (error) {
        console.error("MQTT: Erro ao publicar mensagem:", error);
      }
    } else {
      console.warn('MQTT: Cliente não conectado. Mensagem não publicada.', { topic, payload });
    }
  }, [client, connectionStatus]); // 3. Adicionar as dependências

  const value = {
    connectionStatus,
    connect,
    disconnect,
    publish, // Esta função agora é estável
  };

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};

export const useMQTT = () => {
  return useContext(MQTTContext);
};