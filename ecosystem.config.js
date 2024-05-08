module.exports = {
  apps: [
    {
      name: "IMG-STORE-API",
      script: "node ./dist/server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
