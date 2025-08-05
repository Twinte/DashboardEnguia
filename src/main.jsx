// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './i18n';

import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import { TripProvider } from './context/TripContext';
import { MQTTProvider } from './context/MQTTContext';
import AppInitializer from './components/AppInitializer';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <SensorDataProvider>
          {/* ORDEM CORRIGIDA: MQTTProvider envolve TripProvider */}
          <MQTTProvider>
            <TripProvider>
              <AppInitializer />
            </TripProvider>
          </MQTTProvider>
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);