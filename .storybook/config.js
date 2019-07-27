import { addParameters, configure } from '@storybook/react';

addParameters({
  options: {
    theme: {
      brandTitle: 'zscroller',
      brandUrl: 'https://github.com/yiminghe/zscroller/',
    }
  }
});

// automatically import all files ending in *.stories.js
const req = require.context("../stories", true, /.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
