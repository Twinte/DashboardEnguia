// src/components/AppInitializer.jsx
import React, { useState } from 'react';
import SponsorsScreen from './SponsorsScreen';
import App from '../App';

const AppInitializer = () => {
  // A CHAVE QUE USAREMOS NO SESSION STORAGE
  const LOADED_FLAG_KEY = 'hasLoadedOnce';

  // O estado inicial de 'isLoaded' agora é determinado por uma função.
  // Esta função é executada APENAS UMA VEZ na montagem do componente.
  const [isLoaded, setIsLoaded] = useState(() => {
    // Verifica se a nossa flag já existe no sessionStorage.
    // Se 'true', o estado inicial de isLoaded será true, pulando a tela de carregamento.
    return sessionStorage.getItem(LOADED_FLAG_KEY) === 'true';
  });

  // A função que é chamada quando o SponsorsScreen termina.
  const handleLoadingFinished = () => {
    // 1. Define a flag no sessionStorage para que ela seja lembrada nos próximos recarregamentos.
    sessionStorage.setItem(LOADED_FLAG_KEY, 'true');

    // 2. Atualiza o estado para renderizar a aplicação principal.
    setIsLoaded(true);
  };

  // A lógica de renderização continua a mesma:
  // - Se isLoaded for true, mostra o App.
  // - Se isLoaded for false, mostra a SponsorsScreen.
  return (
    <>
      {isLoaded ? <App /> : <SponsorsScreen onFinished={handleLoadingFinished} />}
    </>
  );
};

export default AppInitializer;