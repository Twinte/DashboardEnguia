// src/main.jsx
import React, { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css'; //
import './i18n'; 
import { SettingsProvider } from './context/SettingsContext'; 
import LoadingScreen from './components/LoadingScreen'; 

// Defina o tempo mínimo que a tela de carregamento deve ser exibida (em milissegundos)
const MINIMUM_LOADING_TIME_MS = 5000; // Exemplo: 2.5 segundos

// Carregar o componente App de forma "preguiçosa" (lazy loading)
// com uma garantia de tempo mínimo de exibição da tela de carregamento
const App = lazy(() => {
  // Cria duas promessas:
  // 1. A importação real do componente App
  const importPromise = import('./App.jsx'); //
  // 2. Uma promessa que só resolve após o tempo mínimo
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, MINIMUM_LOADING_TIME_MS));

  // Promise.all espera que ambas as promessas sejam resolvidas
  return Promise.all([importPromise, timeoutPromise])
    .then(([moduleExports]) => {
      // moduleExports é o resultado da primeira promessa (importPromise)
      // Retornamos o módulo que contém o componente App
      return moduleExports; 
    });
});

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <SettingsProvider>
      <Suspense fallback={<LoadingScreen />}>
        <App /> 
      </Suspense>
    </SettingsProvider>
  </StrictMode>,
);