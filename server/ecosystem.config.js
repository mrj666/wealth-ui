module.exports = {
  apps: [{
    name: 'wealth-ui',
    script: 'src/index.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 16888,
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    time: true,
  }],
};
