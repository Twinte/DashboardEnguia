# Dashboard para Monitoramento de Embarcação Elétrica

Este projeto é uma aplicação de **dashboard interativo** desenvolvido para o monitoramento e controle de uma **embarcação elétrica**. O sistema permite visualizar métricas essenciais relacionadas ao desempenho da embarcação, como **velocidade, direção, consumo de energia, e status da bateria**, além de exibir um mapa interativo com informações de navegação.

## Funcionalidades

### 1. **Dashboard**
- Exibe **informações gerais** sobre a embarcação, incluindo **velocidade (em KPH)**, **RPM do motor**, **status da bateria** e **temperatura**.
- Utiliza **indicadores gráficos** como **odômetros** para visualizar dados de forma clara e intuitiva.

### 2. **Configurações**
- Permite configurar **parâmetros do sistema** da embarcação elétrica, incluindo:
  - Configuração da **cor do painel**.
  - Alteração de **preferências de idioma**.
  - Ajustes do **estilo do dashboard**.
  - Configurações do **banner de cookies**.
- Todas as configurações podem ser alteradas diretamente na interface, com visualização em tempo real.

### 3. **Navegação**
- Exibe um **mapa interativo** utilizando a biblioteca **Leaflet** e sobreposição do **OpenSeaMap** para dados marítimos.
- Inclui um **bússola animada** que rotaciona com base na direção atual da embarcação (cálculo de orientação).
- Exibe **dados de navegação** como **coordenadas atuais**, **ETA (tempo estimado de chegada)**, **tempo restante de navegação** e **faixa de bateria restante**.

## Estrutura do Projeto

O projeto foi desenvolvido utilizando as seguintes tecnologias:
- **React** para a construção do frontend interativo.
- **Vite** como ferramenta de bundling para otimização de desempenho.
- **Leaflet** e **OpenSeaMap** para visualização de mapas e dados marítimos.
- **React-spring** para animações suaves (por exemplo, rotação da bússola).

### Estrutura de Pastas

/src
  /components
    - Dashboard.jsx
    - SettingsPage.jsx
    - NavigationMap.jsx
  /assets
    - compass.svg
  App.jsx
  App.css
  index.js


## Como Rodar o Projeto

Para rodar o projeto localmente, siga os seguintes passos:

### 1. **Clonar o repositório**

```bash
git clone https://github.com/seu-usuario/dashboard-embarcacao-eletrica.git
cd dashboard-embarcacao-eletrica


### 2. **Instalar as dependências**

npm install

### 3. **Rodar a aplicação**

npm run dev

Isso irá iniciar o servidor de desenvolvimento e você poderá acessar o dashboard localmente em http://localhost:5173.
