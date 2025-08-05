// src/context/MQTTContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Paho from 'paho-mqtt';

const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error

  // --- CONFIGURAÇÃO DO BROKER ---
  // !! IMPORTANTE: Estes valores devem vir de variáveis de ambiente no futuro !!
  const brokerHost = 'test.mosquitto.org'; // Usando um broker público para teste
  const brokerPort = 8081; // Porta para WebSockets (WSS)
  const clientId = `electric_boat_dashboard_${Math.random().toString(16).substr(2, 8)}`;

  // Função para conectar ao broker
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
        // Lógica para receber mensagens (não usaremos no dashboard do barco, mas é bom ter)
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
        useSSL: true, // Usar conexão segura (wss://)
        timeout: 5,
        reconnect: true,
      });

    } catch (error) {
        console.error("MQTT: Erro ao criar cliente.", error);
        setConnectionStatus('error');
    }
  };

  // Função para desconectar
  const disconnect = () => {
    if (client) {
      console.log('MQTT: Desconectando...');
      client.disconnect();
      setClient(null);
      setConnectionStatus('disconnected');
    }
  };

  // Função para publicar uma mensagem
  const publish = (topic, payload) => {
    if (client && connectionStatus === 'connected') {
      try {
        const message = new Paho.Message(JSON.stringify(payload));
        message.destinationName = topic;
        message.qos = 1; // Qualidade de Serviço 1: Pelo menos uma vez
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

// Hook para usar o contexto
export const useMQTT = () => {
  return useContext(MQTTContext);
};