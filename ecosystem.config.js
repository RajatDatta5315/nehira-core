module.exports = {
  apps: [{
    name: 'nehira-core',
    script: 'worker.js',
    watch: false,
    restart_delay: 5000,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
