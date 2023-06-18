const path = require("path");

module.exports = {
  mode: "production",
  target: "node",
  entry: "./index.ts",
  output: {
    filename: "ghost_hooks.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
