const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
const config = defaults.__get__("config");

config.optimization.splitChunks = {
  cacheGroups: {
    default: false,
  }
}

config.optimization.runtimeChunk = false;

// Renames js asset to main.js
config.output.filename = "static/js/[name].js";
config.output.chunkFilename = "static/js/[name].js";

// Renames css asset to main.css
config.plugins[5].options.filename = "static/css/[name].css";
config.plugins[5].options.moduleFilename = () => "static/css/main.css";

