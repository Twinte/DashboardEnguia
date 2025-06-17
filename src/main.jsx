// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 1. Importar o BrowserRouter
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './i18n';

import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import AppInitializer from './components/AppInitializer';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    {/* 2. Envolver a aplicação com o BrowserRouter */}
    <BrowserRouter>
      <SettingsProvider>
        <SensorDataProvider>
          <AppInitializer />
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);