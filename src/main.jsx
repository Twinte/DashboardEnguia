// src/main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. Importar o objeto L do Leaflet e os ícones diretamente
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import './index.css';
import './i18n';
import './styles/common.css';
import './styles/Toast.css';

import { SettingsProvider } from './context/SettingsContext';
import { SensorDataProvider } from './context/SensorDataContext';
import { TripProvider } from './context/TripContext';
import { MQTTProvider } from './context/MQTTContext';
import { ToastProvider } from './context/ToastContext';
import AppInitializer from './components/AppInitializer';

// 2. CORREÇÃO: Redefinir os caminhos dos ícones padrão do Leaflet
// Isto "junta" as nossas importações de imagens com a configuração padrão do Leaflet.
// O Vite irá agora processar estas imagens e colocá-las na pasta de build.
delete L.Icon.Default.prototype._getIconUrl; // Remove a implementação antiga
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
                <AppInitializer />
              </ToastProvider>
            </TripProvider>
          </MQTTProvider>
        </SensorDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);