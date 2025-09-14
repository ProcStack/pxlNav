/** @type {import('next').NextConfig} */
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Only treat these file types as pages. This prevents stray `.md` files
	// from being picked up by Next's file-system routing.
	pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

	// Single webpack hook that adds both the IgnorePlugin and the alias mapping
	webpack: (config, { isServer }) => {
		const webpack = require('webpack');
		config.plugins = config.plugins || [];
		// Ignore markdown files during bundling
		config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\.md$/ }));

		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			// Resolve 'three' imports to the ESM build inside the next example's node_modules
			'three': path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
			// Map your custom 'three/addons/...' specifiers to three's examples/jsm
			'three/addons': path.resolve(__dirname, 'node_modules/three/examples/jsm')
		};

		return config;
	}
};

module.exports = nextConfig;
