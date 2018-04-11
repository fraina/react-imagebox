var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'react-imagebox.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
    ]
  }
};
