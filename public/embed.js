(function() {

  let _config = {};

  function debug(msg) {
    if (_config.debug && window.console && window.console.log) {
      window.console.log('[ember-embedded-snippet] %s', msg);
    }
  }

  function injectScript(src) {
    return new Promise((resolve) => {
      let scriptTag = document.createElement('script');
      scriptTag.type = "text/javascript";
      scriptTag.src = src;
      scriptTag.onload = resolve;
      debug('Injecting script: ' + src);
      document.getElementsByTagName("head")[0].appendChild(scriptTag);
    });
  }

  async function injectScripts(jsUrls) {
    for (let src of jsUrls) {
      await injectScript(src);
    }
  }

  function injectStyles(cssUrls) {
    cssUrls.forEach((src) => {
      let cssSelector = "link[href='" + src + "']";

      if (document.querySelector(cssSelector) === null) {

        let cssLink = document.createElement("link");
        cssLink.setAttribute('rel', "stylesheet");
        cssLink.setAttribute('type', "text/css");
        cssLink.setAttribute('href', src);
        debug('Injecting style: ' + src);
        document.getElementsByTagName('head')[0].appendChild(cssLink);
      }
    });
  }

  async function main() {
    let host = _config.host;

    if (!host) {
      // Fetch host from our own script tag
      let scriptTag = document.querySelector('script[src$="/embed.js"]');
      if (!scriptTag) throw new Error('ember-embedded-snippet: Cannot find own script tag');

      host = scriptTag.src.replace(/(https?:\/\/.*?)\/.*/g, '$1');
    }

    host = host.replace(/\/$/, '');

    let cssUrls = [
      prependHostIfRequired('/assets/vendor.css', host),
      prependHostIfRequired('/assets/###APPNAME###.css', host)
    ];

    injectStyles(cssUrls);

    let jsUrls = [
      prependHostIfRequired('/assets/vendor.js', host),
      prependHostIfRequired('/assets/###APPNAME###.js', host)
    ];

    await injectScripts(jsUrls);
    startApp();
  }

  function prependHostIfRequired(url, host) {
    return url.match(/^https?:\/\/.*/) ? url : host + url;
  }

  function ready(fn) {
    if (document.readyState !== 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function deepExtend(out) {
    out = out || {};

    for (let i = 1; i < arguments.length; i++) {
      let obj = arguments[i];

      if (!obj)
        continue;

      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (typeof obj[key] === 'object')
            out[key] = deepExtend(out[key], obj[key]);
          else
            out[key] = obj[key];
        }
      }
    }

    return out;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitForApp(appName) {
    let retryCount = 10;
    let app = window[appName];

    while (!app && retryCount > 0) {
      debug('ember-embedded-snippet: no app found: ' + appName + ', retrying...');
      await delay(100);
      app = window[appName];
    }

    if (!app) {
      throw new Error('ember-embedded-snippet: no app found: ' + appName + ', aborting!');
    }

    return app;
  }

  async function startApp() {
    let appName = _config.appName || 'emberEmbeddedApp';
    let app = await waitForApp(appName);

    let appOptions = deepExtend({ rootElement: _config.root }, _config.options);

    debug('Starting ember app');
    app.start(appOptions);
  }

  window.emberEmbeddedSnippet = function(config) {
    if (!config) {
      throw new Error('ember-embedded-snippet: missing config');
    }

    if (config.root === undefined) {
      throw new Error('ember-embedded-snippet: missing root');
    }

    _config = config;

    ready(main);
  };

})();
