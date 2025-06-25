// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './i18n';

import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import { TripProvider } from './context/TripContext'; // 1. Importar o novo provedor
import AppInitializer from './components/AppInitializer';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <SensorDataProvider>
          {/* 2. Envolver a aplicação com o TripProvider */}
          <TripProvider>
            <AppInitializer />
          </TripProvider>
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);