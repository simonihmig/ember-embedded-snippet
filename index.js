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
    return replace(tree, {
      files: ['embed.js'],
      patterns: [
        {
          match: /###APPNAME###/g,
          replace: this.app.name,
        },
      ],
    });
  },
};
