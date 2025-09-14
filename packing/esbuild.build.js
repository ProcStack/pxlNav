const path = require('path');
const esbuild = require('esbuild');

// Build settings
const root = path.resolve(__dirname, '..');
const entry = path.resolve(root, 'src', 'pxlNav.module.js');
const outFile = path.resolve(root, 'builds', 'pxlNav.module.js');
const tmpOutFile = path.resolve(root, 'builds', 'pxlNav.module.tmp.js');

esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2017'],
  outfile: tmpOutFile,
  sourcemap: false,
  // explicit minify flags to remove extra whitespace/newlines from output
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  // remove license/legal comments (they add extra blank lines sometimes)
  legalComments: 'none',
  external: ['three'],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  plugins: [
    // simple plugin to alias a few paths used in webpack build
    {
      name: 'alias-plugin',
      setup(build) {
        const threeAddons = path.resolve(root, 'node_modules', 'three', 'examples', 'jsm') + '/';
        const fbxLoader = path.resolve(root, 'src', 'libs', 'three', 'FBXLoader.js');

        build.onResolve({ filter: /^three\/addons\// }, args => {
          // map 'three/addons/...foo' to the jsm examples folder
          const sub = args.path.replace(/^three\/addons\//, '');
          return { path: path.join(threeAddons, sub), namespace: 'file' };
        });

        // Map several relative FBXLoader imports to the local copy
        build.onResolve({ filter: /(^\.\.\/\.\.\/libs\/three\/FBXLoader\.js$)|(^\.\.\/libs\/three\/FBXLoader\.js$)|(^\.\/libs\/three\/FBXLoader\.js$)/ }, args => {
          return { path: fbxLoader, namespace: 'file' };
        });
      }
    },
    // GLSL minify plugin: trims blank lines and common indentation inside template literals
    {
      name: 'glsl-minify-plugin',
      setup(build) {
        // Transform loaded JS/TS files and look for template literals that resemble GLSL
        build.onLoad({ filter: /\.js$|\.mjs$|\.cjs$/ }, async (args) => {
          const fs = require('fs');
          const text = await fs.promises.readFile(args.path, 'utf8');

          // Quick heuristic: only process files that contain 'void main' or 'uniform' in them
          if (!/\b(void\s+main|uniform|gl_FragColor|attribute|varying)\b/.test(text)) {
            return { contents: text, loader: 'js' };
          }

          // Replace template literal contents that look like GLSL
          const out = text.replace(/(`)([\s\S]*?)(`)/g, (m, q, inner) => {
            // Heuristic: if inner includes 'void main' treat as shader and minify
            if (/\bvoid\s+main\b/.test(inner) || /\buniform\b/.test(inner)) {
              // remove leading/trailing blank lines
              let lines = inner.split(/\r?\n/);
              // trim each line's common indentation
              const nonEmpty = lines.filter(l => l.trim() !== '');
              if (nonEmpty.length === 0) return '``';
              const indents = nonEmpty.map(l => l.match(/^\s*/)[0].length);
              const minIndent = Math.min(...indents);
              lines = lines.map(l => l.slice(minIndent));
              // remove multiple consecutive blank lines
              const collapsed = [];
              let lastBlank = false;
              for (const L of lines) {
                const isBlank = L.trim() === '';
                if (isBlank && lastBlank) continue;
                collapsed.push(L);
                lastBlank = isBlank;
              }
              const cleaned = collapsed.join('\n');
              return '`' + cleaned + '`';
            }
            return m;
          });

          return { contents: out, loader: 'js' };
        });
      }
    }
  ]
}).then(() => {
  // Post-process to collapse multiple blank lines and trim trailing spaces
  const fs = require('fs');
  let txt = fs.readFileSync(tmpOutFile, 'utf8');
  // collapse 3+ blank lines to 1, and trim trailing spaces
  txt = txt.replace(/[ \t]+$/gm, '');
  txt = txt.replace(/(\r?\n){3,}/g, '\n\n');
  fs.writeFileSync(outFile, txt, 'utf8');
  fs.unlinkSync(tmpOutFile);
  console.log('esbuild: finished writing', outFile);
}).catch((err) => {
  console.error('esbuild: build failed:', err);
  process.exit(1);
});
