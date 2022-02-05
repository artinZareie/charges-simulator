const path = require("path");

module.exports = {
  entry: "./scripts/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  mode: "production",
  watch: true
};
