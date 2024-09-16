# Etapa 1: Construção da aplicação com Node.js
FROM node:18-alpine

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Construir a aplicação
RUN npm run build

# Expor a porta padrão do Nginx
EXPOSE 80

# Comando padrão para iniciar o Nginx
CMD ["npm", "run", "start"]
