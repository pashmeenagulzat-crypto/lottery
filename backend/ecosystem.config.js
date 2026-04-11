// PM2 process configuration for production deployment.
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 reload ecosystem.config.js   # zero-downtime reload
//   pm2 stop lottery-app
//   pm2 delete lottery-app
//   pm2 save && pm2 startup           # persist across reboots
module.exports = {
  apps: [
    {
      name: 'lottery-app',
      script: './server.js',
      cwd: __dirname,

      // Run in fork mode with a single instance.
      // For multi-process Socket.io you would switch to cluster mode and add
      // a shared adapter (e.g. socket.io-redis). For a single-VPS deployment
      // fork mode is safe and simpler.
      instances: 1,
      exec_mode: 'fork',

      // Automatically restart on crash.
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Environment for production.
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
