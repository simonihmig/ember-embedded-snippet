'use strict';

module.exports = {
  name: require('./package').name,

  included() {
    let app = this.app;

    if (app.options.fingerprint === undefined) {
      app.options.fingerprint = {};
    }
    if (app.options.fingerprint.exclude === undefined) {
      app.options.fingerprint.exclude = [];
    }
    app.options.fingerprint.exclude.push('embed.js');

    // do not store config in meta tag
    app.options.storeConfigInMeta = false;


    let config = this.project.config(app.env).embedded;
    if (!config || config.delegateStart === undefined) {
      this.ui.writeWarnLine('No embedded.delegateStart config found. Please set this to true to enable ember-embedded-snippet to pass a custom config!');
    }

  },

  treeForPublic: function(tree) {
    const replace = require('broccoli-replace');
    const concat = require('broccoli-concat');

    const babelAddon = this.addons.find(addon => addon.name === 'ember-cli-babel');
    const needsRegenerator = babelAddon.isPluginRequired('transform-regenerator');
    const regeneratorFile = require.resolve('regenerator-runtime');

    const replacedTree = replace(tree, {
      files: ['**/*'],
      patterns: [
        {
          match: /###APPNAME###/g,
          replace: this.app.name,
        },
      ],
    });

    const concatenatedTree = concat(replacedTree, {
      outputFile: '/embed.js',
      inputFiles: ['**/*'],
      headerFiles: needsRegenerator ? [regeneratorFile] : [],
    })

    return babelAddon.transpileTree(
      concatenatedTree,
      {
        'ember-cli-babel': {
          compileModules: false,
        },
      },
    );
  },
};
