import path from 'node:path';
import webpack from 'webpack';

const config = {
  context: process.cwd(),
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    publicPath: '/demo/build/',
    port: '9001',
    host: '0.0.0.0',
    compress: true,
    disableHostCheck: true,
    stats: {
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      entrypoints: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization'
    }
  },
  entry: {
    demo: './demo/index.js',
    prism: './demo/prism.js',
    diff: './demo/diff.js',
    virtualized: './demo/virtualized.js',
    prismAsyncLight: './demo/prism-async-light.js'
  },
  output: {
    path: path.resolve('demo/build'),
    publicPath: 'build/',
    filename: '[name]-build.js',
    chunkFilename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};

export default config;
