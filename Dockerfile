FROM node:20-alpine3.17

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose port 3000
EXPOSE 3000

RUN npm run build

# Run the app
CMD [ "node", "dist/ghost_hooks.js" ]