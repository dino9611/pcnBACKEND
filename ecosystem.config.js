module.exports = {
    apps: [
      {
        name: "Purwadhika",
        script: "./dist/index.js",
        env: {
          NODE_ENV: "development"
        },
        env_test: {
          NODE_ENV: "test",
        },
        env_staging: {
          NODE_ENV: "staging",
        },
        env_production: {
          NODE_ENV: "production",
        },
        time: true
      }
    ]
  }