# Use Node 20
FROM node:20

WORKDIR /app

# Install Python & Qiskit (Tera Quantum Setup)
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

# 🔥🔥 THE THAPPAD (CACHE BUSTER) 🔥🔥
# Ye line Hugging Face ko force karegi ki wo naya code uthaye.
# Jab bhi tujhe lage purana code chal raha hai, yahan date change kar dena.
RUN echo "FORCE REBUILD: Version 2.0 - Kill The Robot" > cache_bust.txt

# Run the Manager
CMD ["node", "worker.js"]


