console.log('Load babel config');

const node = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: true,
        },
      },
    ],
  ],
};

module.exports = {
  presets: [
    ['@babel/preset-typescript'],
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
      },
    ],
    ['@babel/preset-react'],
  ],

  plugins: ['@babel/plugin-proposal-class-properties'],

  env: {
    node,
    test: {
      ...node,
      sourceMaps: 'inline',
      retainLines: true,
    },
  },
};
