# Use Node.js 20 alpine with build tools
FROM node:20-alpine

# Install Python and build tools needed for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]