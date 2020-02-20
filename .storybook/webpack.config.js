module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve('babel-loader'),

        options: require('../.babelrc'),
      },
    ],
  });
  config.resolve.extensions.push('.ts', '.tsx', '.js', '.css');
  return config;
};
