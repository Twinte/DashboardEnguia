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

  - Node.js (versão 20 ou superior; CI e Docker usam Node.js 22)
  - npm (ou pnpm/yarn)

### 1\. **Clonar o Repositório**

```bash
git clone https://github.com/Twinte/DashboardEnguia.git
cd DashboardEnguia
```

### 2\. **Instalar as Dependências**

```bash
npm ci
```

### 3. **Configurar os serviços**

Copie `.env.example` para `.env` e ajuste `VITE_API_URL` para o endpoint de sensores da embarcação. As variáveis `VITE_MQTT_HOST`, `VITE_MQTT_PORT` e `VITE_MQTT_USE_SSL` configuram o broker WebSocket MQTT.

```bash
cp .env.example .env
```

As variáveis `VITE_*` são públicas e incorporadas no build; não coloque credenciais nelas. Reinicie o Vite após alterar o `.env`.

### 4. **Executar em Modo de Desenvolvimento**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Simulação de Dados

A API Flask e o simulador estão em `enguia/`. Com Python 3 e um ambiente virtual ativo, instale as dependências e execute a API:

```bash
python -m pip install -r enguia/requirements.txt
cd enguia
python app_flask.py
```

Em outro terminal, execute o simulador a partir da mesma pasta:

```bash
cd enguia
python simulate_boat.py
```

A API escuta na porta 8000. O simulador envia dados para `/api/insert_data`, e o dashboard lê `/api/latest_data`. Logs SQLite e o ficheiro `live_data.json` são gerados localmente. Sem API configurada, o frontend tenta `/api/latest_data` na própria origem; esse caminho precisa de um proxy para a API.

O frontend apresenta dados em cache por até cinco minutos após uma falha e tenta reconectar até cinco vezes. Depois, use o botão de nova tentativa. As preferências são guardadas no navegador; opções de segurança e piloto automático são preferências locais e não implementam autenticação ou controlo físico da embarcação.

## Verificação

```bash
npm run lint
npm run test:run
npm run test:coverage
npm run build
```

O relatório de cobertura fica em `coverage/`. O GitHub Actions executa lint, build e testes com cobertura em cada push ou pull request para `main`. A cobertura é informativa; ainda não existe um limite mínimo para toda a interface.

## Deployment com Docker

O projeto inclui um `Dockerfile` para facilitar o deployment em produção.

### 1\. **Construir a Imagem Docker**

A partir da raiz do projeto, execute:

```bash
docker build --build-arg VITE_API_URL=http://localhost:8000/api/latest_data -t dashboard-eletrico .
```

### 2\. **Executar o Container**

```bash
docker run -d -p 8080:80 dashboard-eletrico
```

A aplicação estará acessível em `http://localhost:8080`.

O container serve apenas o frontend. A API precisa estar acessível pelo navegador no endereço fornecido em `VITE_API_URL`; em produção, use o endereço público da API. Para páginas HTTPS, use também API e MQTT seguros. As configurações MQTT podem ser passadas com os argumentos de build `VITE_MQTT_HOST`, `VITE_MQTT_PORT` e `VITE_MQTT_USE_SSL`.
