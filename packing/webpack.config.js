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
      // Prefer project-local three build in ./src/react-next-dev/pxlnav-next/src/components/libs/three
      'three': path.resolve(__dirname, '../src/react-next-dev/pxlnav-next/src/components/libs/three/three.module.min.js'),
      // Map explicit FBXLoader relative imports to the local copy
      '../../libs/three/FBXLoader.js': path.resolve(__dirname, '../src/react-next-dev/pxlnav-next/src/components/libs/three/FBXLoader.js'),
      '../libs/three/FBXLoader.js': path.resolve(__dirname, '../src/react-next-dev/pxlnav-next/src/components/libs/three/FBXLoader.js'),
      './libs/three/FBXLoader.js': path.resolve(__dirname, '../src/react-next-dev/pxlnav-next/src/components/libs/three/FBXLoader.js')
    },
  },
  externals: {
    'three' : './three.module.js',
    './libs/three/three.module.min.js' : './libs/three/three.module.min.js',
    '../libs/three/three.module.min.js' : './libs/three/three.module.min.js',
    '../../libs/three/three.module.min.js' : './libs/three/three.module.min.js',
    '../../../libs/three/three.module.min.js' : './libs/three/three.module.min.js',
    '../../../../libs/three/three.module.min.js' : './libs/three/three.module.min.js',
    '../../three/EffectComposer.js' : './libs/three/three.module.min.js',
    './pxlNav.js' : './pxlNav.esm.js',
    '../../pxlNav.js' : '../../pxlNav.esm.js',
    '../libs/three/EffectComposer.js': "./libs/three/EffectComposer.js",
    '../libs/three/RenderPass.js': "./libs/three/RenderPass.js",
    '../libs/three/ShaderPass.js': "./libs/three/ShaderPass.js",
    '../libs/three/UnrealBloomPass.js': "./libs/three/UnrealBloomPass.js",
    '../libs/three/CopyShader.js': "./libs/three/CopyShader.js",
    '../../libs/three/FBXLoader.js': "./libs/three/FBXLoader.js",
  },
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
});

module.exports = [cjsConfig, umdConfig, esmConfig];
