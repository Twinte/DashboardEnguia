import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Importar estilos globais (incluindo variáveis de tema)
import './index.css'; 

// 2. Importar e inicializar a configuração do i18next
//    Certifique-se que o ficheiro 'src/i18n.js' existe e está configurado
//    como mostrado no Passo 3. A simples importação executa a inicialização.
import './i18n'; 

// 3. Importar o componente principal da aplicação
import App from './App.jsx';

// 4. Importar o Provedor do Contexto de Configurações
//    Certifique-se que o ficheiro 'src/context/SettingsContext.js' existe
//    e está criado como mostrado no Passo 4.
import { SettingsProvider } from './context/SettingsContext'; 

// 5. Obter o elemento root do HTML
const rootElement = document.getElementById('root');

// 6. Criar a raiz do React
const root = createRoot(rootElement);

// 7. Renderizar a aplicação
root.render(
  <StrictMode>
    {/* 8. Envolver toda a aplicação com o SettingsProvider */}
    {/* Isto disponibiliza o contexto (tema, idioma) para todos os */}
    {/* componentes descendentes, incluindo o App. */}
    <SettingsProvider>
      <App /> 
    </SettingsProvider>
  </StrictMode>,
);