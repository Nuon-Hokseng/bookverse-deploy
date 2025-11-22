# Use Node.js LTS
FROM node:24-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]
