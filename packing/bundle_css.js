const esbuild = require('esbuild');

// Define the entry point and output file for CSS
const cssEntryFile = './src/style/pxlNavStyle.css';
const cssOutputFiles = [
  './builds/pxlNavStyle.min.css',
  './examples/esm/pxlNavStyle.min.css',
  './examples/react-app/public/pxlNavStyle.min.css',
  './examples/nextjs/public/pxlNavStyle.min.css'
  ];

// Bundle and minify the CSS
cssOutputFiles.forEach((outputFile) => {
  esbuild.build({
    entryPoints: [cssEntryFile],
    bundle: true,
    minify: true,
    outfile: outputFile,
    loader: {
      '.css': 'css'
    },
  }).then(() => {
    console.log('CSS bundling and minification complete:', outputFile);
  }).catch((error) => {
    console.error('CSS bundling and minification error:', error);
  });
});