# Use an official Node runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Copy the entire project
COPY . .

# Install dependencies using the script in package.json
RUN npm run install

# Build both server and client
RUN npm run build

# Expose the port the server runs on (adjust if your server uses a different port)
EXPOSE 3000

# Command to start both server and client
CMD ["npm", "start"]