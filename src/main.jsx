// src/main.jsx
// Data da Modificação: 16 de junho de 2025

// Não precisamos mais de Suspense ou lazy aqui
import React, { StrictMode } from 'react'; 
import { createRoot } from 'react-dom/client';

// Importar estilos globais
import './index.css';

// Importar a configuração do i18next (para traduções)
import './i18n'; 

// Importar o provedor de contexto para tema e idioma
import { SettingsProvider } from './context/SettingsContext'; 

// Importar o nosso novo componente inicializador, que agora controla o fluxo de carregamento
import AppInitializer from './components/AppInitializer';

// Obter o elemento root do HTML
const rootElement = document.getElementById('root');

// Criar a raiz do React para renderização
const root = createRoot(rootElement);

// Renderizar a aplicação
root.render(
  <StrictMode>
    <SettingsProvider>
      {/* Renderiza apenas o AppInitializer. 
        Este componente agora tem a responsabilidade de mostrar a tela de carregamento (SponsorsScreen) 
        e, quando terminar, renderizar a aplicação principal (App).
      */}
      <AppInitializer />
    </SettingsProvider>
  </StrictMode>,
);