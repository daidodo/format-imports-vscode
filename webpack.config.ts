import path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  mode: 'production',
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    eslint: 'commonjs eslint',
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.ts', '.js'],
    // fallback: {
    //   fs: false,
    //   module: false,
    //   net: false,
    //   perf_hooks: false,
    //   cluster: false,
    //   url: require.resolve('url'),
    //   path: require.resolve('path-browserify'),
    //   os: require.resolve('os-browserify/browser'),
    //   crypto: require.resolve('crypto-browserify'),
    //   util: require.resolve('util'),
    //   assert: require.resolve('assert'),
    //   zlib: require.resolve('browserify-zlib'),
    //   stream: require.resolve('stream-browserify'),
    //   constants: require.resolve('constants-browserify'),
    //   console: require.resolve('console-browserify'),
    //   buffer: require.resolve('buffer'),
    // },
  },
  node: {
    __dirname: 'mock',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
};

export default config;
