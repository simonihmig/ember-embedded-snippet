(function() {

  var _config = {};

  var retryCount = 5;


  function debug(msg) {
    if (_config.debug && window.console && window.console.log) {
      window.console.log('[ember-embedded-snippet] %s', msg);
    }
  }

  function injectScripts(jsUrls, cb) {
    var count = jsUrls.length;
    var loaded = 0;
    var nextUrl;

    function next() {

      if (loaded < count) {
        var scriptTag = document.createElement('script');
        nextUrl = jsUrls[loaded++];
        scriptTag.type = "text/javascript";
        scriptTag.src = nextUrl;
        scriptTag.onload = next;
        debug('Injecting script: ' + nextUrl);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
      } else {
        if (cb) {
          cb();
        }
      }
    }

    next();
  }

  function injectStyles(cssUrls) {
    cssUrls.forEach(function(value, key){
      var cssSelector = "link[href='" + value + "']";

      if (document.querySelector(cssSelector) === null) {

        var cssLink = document.createElement("link");
        cssLink.setAttribute('rel', "stylesheet");
        cssLink.setAttribute('type', "text/css");
        cssLink.setAttribute('href', value);
        debug('Injecting style: ' + value);
        document.getElementsByTagName('head')[0].appendChild(cssLink);
      }
    });
  }

  function main() {
    // Fetch host from our own script tag
    var scriptTag = document.querySelector('script[src$="/embed.js"]');
    if (!scriptTag) throw new Error('ember-embedded-snippet: Cannot find own script tag');

    var host = scriptTag.src.replace(/(https?:\/\/.*?)\/.*/g, '$1');

    var cssUrls = [
      prependHostIfRequired('/assets/vendor.css', host),
      prependHostIfRequired('/assets/###APPNAME###.css', host)
    ];

    injectStyles(cssUrls);

    var jsUrls = [
      prependHostIfRequired('/assets/vendor.js', host),
      prependHostIfRequired('/assets/###APPNAME###.js', host)
    ];

    injectScripts(jsUrls, startApp);
  }

  function prependHostIfRequired(url, host) {
    return url.match(/^https?:\/\/.*/) ? url : host + url;
  }

  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }


  function startApp() {
    var appName = _config.appName || 'emberEmbeddedApp';
    var app = window[appName];
    if (!app) {
      if (0 < retryCount--) {
        debug('ember-embedded-snippet: no app found: ' + appName + ', retrying...');
        setTimeout(startApp, 100);
      } else {
        debug('ember-embedded-snippet: no app found: ' + appName + ', aborting!');
      }
      return;
    }

    var deepExtend = function(out) {
      out = out || {};

      for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];

        if (!obj)
          continue;

        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object')
              out[key] = deepExtend(out[key], obj[key]);
            else
              out[key] = obj[key];
          }
        }
      }

      return out;
    };
    var appOptions = deepExtend({ rootElement: _config.root }, _config.options);

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
