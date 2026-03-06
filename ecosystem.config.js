module.exports = {
  apps: [{
    name: 'nehira-core',
    script: 'server.js',
    watch: false,
    autorestart: true,
    restart_delay: 5000,
    max_restarts: 50,
    env: { NODE_ENV: 'production', PORT: 3001 }
  }]
};
