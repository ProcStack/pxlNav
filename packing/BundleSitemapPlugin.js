const path = require('path');
const { sources } = require('webpack');

class BundleSitemapPlugin {
  constructor(options = {}) {
    this.filename = options.filename || 'build-sitemap.json';
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('BundleSitemapPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'BundleSitemapPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          // Collect emitted asset filenames
          const assetNames = Object.keys(assets || {});

          // Collect chunk -> files map
          const chunks = compilation.chunks.map(chunk => ({
            id: chunk.id,
            name: chunk.name,
            files: Array.from(chunk.files || [])
          }));

          // Collect module resource paths (best-effort)
          const modules = [];
          for (const mod of compilation.modules) {
            // module.resource is usually the absolute path to the source file
            const resource = mod.resource || (mod.rootModule && mod.rootModule.resource) || null;
            if (resource) {
              modules.push(path.relative(compiler.context, resource));
            } else {
              // Fallback to identifier when no resource available
              try {
                modules.push(mod.identifier());
              } catch (e) {
                modules.push(String(mod));
              }
            }
          }

          const sitemap = { assets: assetNames, chunks, modules };
          const content = JSON.stringify(sitemap, null, 2);
          console.log(`BundleSitemapPlugin: Emitting sitemap with ${assetNames.length} assets, ${chunks.length} chunks, and ${modules.length} modules to ${this.filename}`);

          compilation.emitAsset(this.filename, new sources.RawSource(content));
        }
      );
    });
  }
}

module.exports = BundleSitemapPlugin;
