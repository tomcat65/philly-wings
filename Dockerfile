# Use Node.js LTS as base
FROM node:18-alpine

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 make g++

# Install Java for Firebase emulators
RUN apk add --no-cache openjdk11-jre-headless

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Firebase tools globally
RUN npm install -g firebase-tools

# Copy all project files
COPY . .

# Build the project if needed
RUN npm run build || echo "No build script found"

# Expose ports
# Vite dev server
EXPOSE 5173
# Firebase emulator UI
EXPOSE 4000
# Firebase Auth emulator
EXPOSE 9099
# Firestore emulator
EXPOSE 8080
# Storage emulator
EXPOSE 9199
# Hosting emulator
EXPOSE 5000

# Start both dev server and Firebase emulators
CMD ["sh", "-c", "firebase emulators:start --import=./emulator-data --export-on-exit & npm run dev -- --host 0.0.0.0"]