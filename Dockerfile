# Use Node 20 (Latest Version for Wrangler)
FROM node:20

WORKDIR /app

# Install Python & Qiskit for Quantum Module
# Break-system-packages flag is needed for newer Python environments
RUN apt-get update && apt-get install -y python3 python3-pip git
RUN pip3 install qiskit numpy --break-system-packages

# Copy Config
COPY package*.json ./

# Install Dependencies
RUN npm install
RUN npm install -g wrangler

# Copy All Files
COPY . .

# Permissions
RUN chmod -R 777 /app

# Run the Manager
CMD ["npm", "run", "worker"]

