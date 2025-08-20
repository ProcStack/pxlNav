/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Only treat these file types as pages. This prevents stray `.md` files
	// from being picked up by Next's file-system routing.
	pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

	// Add a webpack IgnorePlugin so `.md` files are ignored during bundling
	// (defense-in-depth in case other loaders/plugins surface them).
	webpack: (config, { isServer }) => {
		const webpack = require('webpack');
		config.plugins = config.plugins || [];
		config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\.md$/ }));
		return config;
	},
};

module.exports = nextConfig;
