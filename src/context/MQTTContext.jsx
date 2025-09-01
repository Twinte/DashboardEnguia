// src/context/MQTTContext.jsx
import React, { createContext, useContext, useState } from 'react';
import Paho from 'paho-mqtt';
import { useToast } from './ToastContext'; // 1. Importar o hook do toast

const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { addToast } = useToast(); // 2. Chamar o hook para usar as notificações

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
          // 3. Adicionar notificação de erro de conexão perdida
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
          // 3. Adicionar notificação de sucesso
          addToast('Conexão MQTT estabelecida!', 'success');
        },
        onFailure: (err) => {
          console.error('MQTT: Falha ao conectar:', err);
          setConnectionStatus('error');
          // 3. Adicionar notificação de erro ao conectar
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

  const publish = (topic, payload) => {
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
  };

  const value = {
    connectionStatus,
    connect,
    disconnect,
    publish,
  };

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};

export const useMQTT = () => {
  return useContext(MQTTContext);
};