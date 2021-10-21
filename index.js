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

    // we start the app explicitly
    app.options.autoRun = false;
  },

  config(env, baseConfig) {
    this._rootURL = baseConfig.rootURL;
  },

  _process(appTree) {
    const mergeTrees = require('broccoli-merge-trees');
    const compileEmbedScript = require('./lib/compile-embed');
    const ProcessHtmlPlugin = require('./lib/process-html');

    const embedTree = compileEmbedScript(this.app);
    const htmlTree = new ProcessHtmlPlugin(appTree, {
      rootURL: this._rootURL,
      ui: this.project.ui,
      appName: this.app.name,
    });

    return mergeTrees([appTree, embedTree, htmlTree], { overwrite: true });
  },

  process(app, appTree) {
    let ownAddon = app.project.findAddonByName('ember-embedded-snippet');

    if (!ownAddon) {
      throw new Error(
        "Could not find initialized ember-embedded-snippet addon. It must be part of your app's dependencies!"
      );
    }

    return ownAddon._process(appTree);
  },
};
