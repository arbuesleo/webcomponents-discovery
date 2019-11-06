module.exports = {
  output: {
    filename: 'components.bundle.js'
  },
  module: {
    rules: [
      { test: /\.html$/, use: 'raw-loader', exclude: /node_modules/ }
    ]
  }
};