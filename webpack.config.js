const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: [
		'webpack-dev-server/client?http://localhost:8080',
		'webpack/hot/dev-server',
		'./src/index.ts',
	],
	output: {
		filename: '/bundle.js',
		path: path.join(__dirname, 'build'),
		publicPath: '/build/'
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: "source-map-loader"
			},
			{
				enforce: 'pre',
				test: /\.tsx?$/,
				use: "awesome-typescript-loader?"
			},
			{
				test: /\.sass$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: "css-loader!sass-loader"
				})
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	devtool: 'inline-source-map',
	plugins: [
		new webpack.HotModuleReplacementPlugin(), // enable HMR globally
		new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
		new ExtractTextPlugin("styles.css")
	],
};