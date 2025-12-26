# Use Node.js Image
FROM node:18

# Create App Directory
WORKDIR /app

# Install Dependencies
COPY package*.json ./
RUN npm install

# Copy App Source
COPY . .

# Build Next.js (Zaroori hai taaki errors na aayein)
RUN npm run build

# Start the WORKER (Not the website)
CMD ["npm", "run", "worker"]
