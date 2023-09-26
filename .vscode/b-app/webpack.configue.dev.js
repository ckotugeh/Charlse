const webpack=require('webpack');
const path=require('path');
const HtmlWebpackPlugin=require('html-webpack-plugin');

process.env.NODE_ENV ='development';

module.exports={
    mode: 'development',
    target: 'web',
    devTool: 'cheap-module-dev-map',
    entry: './src/index',
    output: {
        path:path.resolve(__dirname, "build"),
        public:'/',
        filename: 'bundle.js',
    },
    deveServer:{
        start: 'minimal',
        overlay: true,
        historyAppFallback: true,
        disableHostCheck: true,
        Header: {"access-conrol-allowed-origin":"*"},
        https: false,
    },
    Plugin:[
        new HtmlWebpackPlugin({
            template:'/src/index.html',
            favicon: '/src/fivicon.icon',
        })
    ]
}