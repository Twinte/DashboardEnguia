// src/context/MQTTContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Paho from 'paho-mqtt';

const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // --- CONFIGURAÇÃO DO BROKER ATUALIZADA ---
  // Trocamos o servidor 'test.mosquitto.org' pelo 'broker.hivemq.com', que é mais estável.
  const brokerHost = 'broker.hivemq.com';
  const brokerPort = 8884; // O HiveMQ usa a porta 8884 para WSS
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
        },
        onFailure: (err) => {
          console.error('MQTT: Falha ao conectar:', err);
          setConnectionStatus('error');
        },
        useSSL: true, // Continuamos a usar conexão segura (wss://)
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