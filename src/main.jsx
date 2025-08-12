// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './i18n';
import './styles/common.css';
import './styles/Toast.css'; // <-- ADICIONE O CSS DOS TOASTS

import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import { TripProvider } from './context/TripContext';
import { MQTTProvider } from './context/MQTTContext';
import { ToastProvider } from './context/ToastContext'; // <-- IMPORTE O PROVIDER
import AppInitializer from './components/AppInitializer';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <SensorDataProvider>
          <MQTTProvider>
            <TripProvider>
              {/* Envolva o AppInitializer com o ToastProvider */}
              <ToastProvider>
                <AppInitializer />
              </ToastProvider>
            </TripProvider>
          </MQTTProvider>
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);