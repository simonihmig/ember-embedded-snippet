'use strict';

function _process(app, appTree) {
  const mergeTrees = require('broccoli-merge-trees');
  const compileEmbedScript = require('./lib/compile-embed');

  const embedTree = compileEmbedScript(app);

  return mergeTrees([appTree, embedTree]);
}

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

  process(app, tree) {
    return _process(app, tree);
  },
};
