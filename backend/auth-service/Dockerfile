# Use Node.js LTS
FROM node:24-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

# Expose the port your app listens on
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]
