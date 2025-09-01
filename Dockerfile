# --- Estágio 1: Build da Aplicação React ---
# Usa uma imagem oficial do Node.js como base. 'alpine' é uma versão leve.
FROM node:18-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de pacotes e instala as dependências.
# Fazer isso em um passo separado aproveita o cache do Docker.
COPY package*.json ./
RUN npm install

# Copia todo o resto do código-fonte da aplicação
COPY . .
# Declara um argumento de build que podemos passar no comando docker build
ARG VITE_API_URL

# Executa o comando de build, passando o argumento como uma variável de ambiente
RUN VITE_API_URL=$VITE_API_URL npm run build

# --- Estágio 2: Servidor de Produção ---
# Usa uma imagem oficial e leve do Nginx para servir os arquivos
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no Estágio 1 para o diretório padrão do Nginx
# A flag --from=build referencia o estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# NOVO: Copia o nosso ficheiro de configuração personalizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Informa ao Docker que o container escuta na porta 80
EXPOSE 80

# Comando para iniciar o Nginx quando o container for executado
CMD ["nginx", "-g", "daemon off;"]