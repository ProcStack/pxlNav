const path = require('path');
const { IgnorePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
/*const CopyWebpackPlugin = require('copy-webpack-plugin');*/
/*const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;*/
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const webpack = require('webpack');


var entryPath="src";
var entryPoints = {
      "js/pxlNav":`./${entryPath}/pxlNav.js`,
      /*"style/pxlNav": `./${entryPath}/style/pxlNavStyle.css`*/
    };

const pxlNavChunkDir = "pxlNavChunks";

const baseConfig = {
  mode: 'production',
  entry: entryPoints,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname, '.babelrc'),
            plugins: ['@babel/plugin-syntax-dynamic-import']
          }
        }
      }
    ]
  },
  // Keep pxlRooms imports unbundled so consumers can provide their own pxlRooms/index.js
  externals: [
    function({ request }, callback) {
      // If the import path refers to pxlRooms (any depth), treat it as external so webpack
      // will not bundle it and the runtime consumer can provide their own module.
      if (typeof request === 'string' && request.indexOf('pxlRooms') !== -1) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          mangle: {
            reserved: ['pxlNav', 'pxlNavVersion', 'pxlEnums', 'pxlOptions']
          },
          compress: {
            dead_code: true,
            unused: true
          },
          output: {
            comments: false,
          }
        },
        extractComments: false,
      })
    ],
    splitChunks: false, // Disable chunking
    runtimeChunk: false, // Disable runtime chunk
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
    }),
    new MiniCssExtractPlugin({
      filename: 'style/pxlNavStyle.css'
    }),
    new IgnorePlugin({
      resourceRegExp: /Environment\.js$/,
      contextRegExp: /import\(.*\)/
    }),
    /*new CopyWebpackPlugin({
      patterns: copyFileList,
    }),*/
    /*new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),*/
  ],
  resolve: {
    alias: {
      'three/addons/': path.resolve(__dirname, '../node_modules/three/examples/jsm/'),
      // Map explicit FBXLoader relative imports to the local copy
      '../../libs/three/FBXLoader.js': path.resolve(__dirname, '../src/libs/three/FBXLoader.js'),
      '../libs/three/FBXLoader.js': path.resolve(__dirname, '../src/libs/three/FBXLoader.js'),
      './libs/three/FBXLoader.js': path.resolve(__dirname, '../src/libs/three/FBXLoader.js')
    },
  },
  // Note: target-specific externals are added per-output below (CJS/UMD/ESM) so we can
  // treat 'three' differently for UMD (global THREE) vs ESM/CJS (import/require 'three').
};


// Parent Folder Path
let parentFolderPath = path.resolve(__dirname, '../builds/');

// CJS Configuration
const cjsConfig = merge(baseConfig, {
  output: {
    filename: 'pxlNav.cjs.js',
    //path: path.resolve( parentFolderPath, 'cjs'),
    path: parentFolderPath,
    library: {
      type: 'commonjs2',
      export: 'default',
    },
  },
  // For CommonJS consumers, require/import 'three' from node_modules
  externals: [
    ...(baseConfig.externals || []),
    {
      'three': {
        commonjs: 'three',
        commonjs2: 'three',
        amd: 'three',
        root: 'THREE'
      },
      './libs/three/three.module.min.js': './libs/three/three.module.min.js',
    }
  ],
});

// UMD Configuration
const umdConfig = merge(baseConfig, {
  output: {
    filename: 'pxlNav.umd.js',
    //path: path.resolve( parentFolderPath, 'umd'),
    path: parentFolderPath,
    publicPath: '/',
    library: {
      type: 'umd',
      export: 'default',
    },
  },
  // For UMD (browser) builds, expect a global THREE variable at runtime
  externals: [
    ...(baseConfig.externals || []),
    {
      'three': {
        root: 'THREE',
        commonjs: 'three',
        commonjs2: 'three',
        amd: 'three'
      }
    }
  ],
});

// ESM Configuration
const esmConfig = merge(baseConfig, {
  output: {
    filename: 'pxlNav.esm.js',
    //path: path.resolve( parentFolderPath, 'esm'),
    path: parentFolderPath,
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  // For ESM consumers, keep 'three' as an external import
  externals: [
    ...(baseConfig.externals || []),
    {
      'three': 'three'
    }
  ],
});

module.exports = [cjsConfig, umdConfig, esmConfig];
