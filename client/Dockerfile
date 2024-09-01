# Etapa 1: Construção da aplicação com Node.js
FROM node:18 AS build-stage

ARG vite_api_url

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

ENV VITE_API_URL=${VITE_API_URL}

# Construir a aplicação
RUN npm run build

# Etapa 2: Servindo a build com Nginx
FROM nginx:alpine AS production-stage

# Copiar a build do front-end para o diretório correto do Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expor a porta padrão do Nginx
EXPOSE 80

# Comando padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]   
