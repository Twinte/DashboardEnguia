// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import './index.css';
import './i18n';
import './styles/common.css';
import './styles/Toast.css';
import './styles/Skeletons.css';

import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import { TripProvider } from './context/TripContext';
import { MQTTProvider } from './context/MQTTContext';
import { ToastProvider } from './context/ToastContext';
import { AlertProvider } from './context/AlertContext'; // 1. Importar o AlertProvider
import AppInitializer from './components/AppInitializer';

// Correção para os ícones do Leaflet em produção
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <SensorDataProvider>
          <MQTTProvider>
            <TripProvider>
              <ToastProvider>
                {/* 2. Envolver a aplicação com o AlertProvider */}
                <AlertProvider>
                  <AppInitializer />
                </AlertProvider>
              </ToastProvider>
            </TripProvider>
          </MQTTProvider>
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);