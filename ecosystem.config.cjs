module.exports = {
  apps: [
    {
      name: 'verix-bot',
      cwd: '/root/Verix-Bot',
      script: 'index.js',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true,
      max_memory_restart: '700M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 2000,
      kill_timeout: 15000,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'verix-dashboard-client',
      cwd: '/root/Verix-Bot/dashboard/client',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      time: true,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 2000,
      kill_timeout: 15000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
