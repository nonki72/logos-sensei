module.exports = {
  apps : [
      {
        name: "Logos sensei",
        script: "node -- loader.js",
        watch: true,
        autorestart : false,
        env: {
          "GOOGLE_APPLICATION_CREDENTIALS":"/home/jordocote/.google/logos-162301-5257396ab743.json",
          "GCLOUD_PROJECT": "logos-162301",
          "CLOUD_BUCKET": "logos-162301",
          "MYSQL_USER":"logos",
          "MYSQL_PASSWORD":"sparkle8twilight",
          "MYSQL_DATABASE":"logos",
          "MYSQL_HOST":"localhost"
        }
      }
  ]
}
