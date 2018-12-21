const path = require('path');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    background: path.join(__dirname, 'app', 'background'),
    popup: path.join(__dirname, 'app', 'popup'),
    detectjspsych: path.join(__dirname, 'app', 'detectjspsych'),
    messagepasser: path.join(__dirname, 'app', 'messagepasser')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /.jsx?$/,
      include: [
        path.resolve(__dirname, 'app')
      ],
      exclude: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'bower_components')
      ],
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    },
    {
      test: /\.css$/,
      use:[
        'style-loader',
        'css-loader'
      ]
    }]
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css']
  },
  devtool: 'source-map',
  devServer: {
    publicPath: path.join('/dist/')
  },
  plugins: [
    new ChromeExtensionReloader({
      port: 8080,
      reloadPage: true,
      entries: {
        background: 'background',
        contentScript:['detectjspsych', 'messagepasser'],
        popup: 'popup'
      }
    }),
    new HtmlWebpackPlugin({
      'title': "jsPsychHardware Configuration",
      filename: "popup.html",
      template: 'app/popup.html',
      chunks: ['popup']
    }),
    new CopyWebpackPlugin([
      "app/manifest.json",
      {
        from: "app/media/*",
        to:"media/[name].[ext]",
        flatten: true
      },
      "app/StreamSaver.js"
    ])
  ]
};