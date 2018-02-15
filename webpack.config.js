var path = require('path');
var glob = require("glob");

module.exports = {
  entry: glob.sync("./views/**/*.js"),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};