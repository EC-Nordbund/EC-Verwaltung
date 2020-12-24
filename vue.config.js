const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  // configureWebpack: {
  //   plugins: [new BundleAnalyzerPlugin()]
  // },
  chainWebpack: config => {
    config.optimization.delete('splitChunks')
  }
}