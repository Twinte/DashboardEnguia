# Dashboard para Monitorização de Embarcação Elétrica

Este projeto é uma aplicação de **dashboard interativo** desenvolvida para a monitorização e controlo em tempo real de uma **embarcação elétrica**. O sistema permite visualizar métricas essenciais de desempenho, gerir a navegação com um mapa interativo e configurar diversas preferências do sistema, tudo numa interface moderna e responsiva.

## Funcionalidades Principais

### 1\. **Dashboard Principal (Home)**

  - Exibe **informações vitais** num piscar de olhos, incluindo **velocidade (KPH)**, **RPM do motor**, **percentagem da bateria** e **velocidade do vento**.
  - Utiliza **medidores gráficos (gauges)** para uma visualização clara e intuitiva dos dados.

### 2\. **Navegação Interativa**

  - Apresenta um **mapa interativo** que utiliza **Leaflet** para visualização.
  - **Planeamento de Rota:** Permite adicionar pontos de passagem (`waypoints`) diretamente no mapa para criar uma rota.
  - **Acompanhamento em Tempo Real:** Exibe a posição atual da embarcação com um marcador que indica a direção (`heading`).
  - **Telemetria via MQTT:** Durante uma viagem ativa, os dados de telemetria (coordenadas, velocidade) são publicados em tempo real para um broker MQTT, permitindo o acompanhamento remoto.

### 3\. **Gestão de Energia**

  - Uma página dedicada para monitorizar detalhadamente o estado da bateria, incluindo **percentagem de carga**, **voltagem** e **temperatura**.

### 4\. **Configurações Avançadas**

  - Painel de configurações que permite personalizar a experiência do utilizador.
  - Opções incluem a alteração de **tema (claro/escuro)** e **idioma (inglês/português)**, com as preferências a serem guardadas localmente.

## Tecnologias Utilizadas

  - **Frontend:** React, Vite
  - **Roteamento:** React Router
  - **Gestão de Estado:** React Context API
  - **Mapa:** Leaflet, React-Leaflet, Leaflet Routing Machine
  - **Comunicação em Tempo Real:** Paho MQTT
  - **Internacionalização:** i18next
  - **Containerização:** Docker, Nginx

## Estrutura do Projeto

```
/src
  /assets          # Imagens, logos e outros recursos estáticos
  /components      # Componentes React reutilizáveis (HomePage, SettingsPage, etc.)
  /context         # Contextos React para gestão de estado (SensorData, Settings, etc.)
  /locales         # Ficheiros de tradução (JSON)
  /utils           # Funções utilitárias (formatação, cálculos, etc.)
  App.jsx          # Componente principal da aplicação e estrutura de rotas
  main.jsx         # Ponto de entrada da aplicação
  i18n.js          # Configuração da internacionalização
```

## Como Executar o Projeto

Siga os passos abaixo para executar o projeto localmente.

### Pré-requisitos

  - Node.js (versão 18 ou superior)
  - npm (ou pnpm/yarn)

### 1\. **Clonar o Repositório**

```bash
git clone https://github.com/seu-usuario/dashboard-embarcacao-eletrica.git
cd dashboard-embarcacao-eletrica
```

### 2\. **Instalar as Dependências**

```bash
npm install
```

### 3\. **Executar em Modo de Desenvolvimento**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Simulação de Dados

Para o desenvolvimento local, o projeto obtém dados de uma API que, por sua vez, é alimentada por um script de simulação. O ficheiro `main.py` gera dados realistas de sensores (velocidade, RPM, bateria, etc.) e armazena-os numa base de dados SQLite, que serve de fonte para a API.

## Deployment com Docker

O projeto inclui um `Dockerfile` para facilitar o deployment em produção.

### 1\. **Construir a Imagem Docker**

A partir da raiz do projeto, execute:

```bash
docker build -t dashboard-eletrico .
```

### 2\. **Executar o Container**

```bash
docker run -d -p 8080:80 dashboard-eletrico
```

A aplicação estará acessível em `http://localhost:8080`.
