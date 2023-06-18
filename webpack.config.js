const path = require('path');

module.exports = {
  type: 'module',
  entry: './index.ts',
  output: {
    filename: 'ghost_hooks.js',
    path: path.resolve(__dirname, 'dist')
  }
};
