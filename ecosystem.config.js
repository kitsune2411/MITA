module.exports = {
  apps: [
    {
      name: "mita-app",
      script: "dist/server.js",
      exec_mode: "cluster",
      instances: 2, // run 2 instances
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
