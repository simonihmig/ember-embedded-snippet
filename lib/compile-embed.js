const path = require('path');

module.exports = function compileEmbedScript(app) {
  const replace = require('broccoli-replace');
  const concat = require('broccoli-concat');
  const UnwatchedDir = require('broccoli-source').UnwatchedDir;

  const babelAddon = app.project.findAddonByName('ember-cli-babel');
  const needsRegenerator = babelAddon.isPluginRequired('transform-regenerator');
  const regeneratorFile = require.resolve('regenerator-runtime');

  const tree = new UnwatchedDir(path.join(__dirname, 'public'));

  const replacedTree = replace(tree, {
    files: ['**/*'],
    patterns: [
      {
        match: /###APPNAME###/g,
        replace: app.name,
      },
    ],
  });

  const concatenatedTree = concat(replacedTree, {
    outputFile: '/embed.js',
    inputFiles: ['**/*'],
    headerFiles: needsRegenerator ? [regeneratorFile] : [],
  });

  return babelAddon.transpileTree(concatenatedTree, {
    'ember-cli-babel': {
      compileModules: false,
    },
  });
};
