/* global require */

(function() {

  function debug(msg) {
    console.debug('[ember-embedded-snippet] %s', msg);
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

  async function setup(host) {
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
  }

  function prependHostIfRequired(url, host) {
    return url.match(/^https?:\/\/.*/) ? url : host + url;
  }

  async function startApp(rootElement, config = {}) {
    debug(`Starting ember app "###APPNAME###"`);

    return require('###APPNAME###/app').default.create({
      // rootElement: this.#shadowRoot.querySelector(`[data-ember-root-element]`),
      rootElement,
      config
    })
  }

  class EmbeddedApp extends HTMLElement {
    #rootElement;
    #setupPromise;
    #application;

    constructor() {
      super();

      this.#rootElement = this;

      this.#setupPromise = setup();
    }

    async connectedCallback() {
      if (this.#application) {
        return;
      }

      await this.#setupPromise;

      this.#application = await startApp(this.#rootElement);
    }

    disconnectedCallback() {
      if (!this.#application.isDestroyed && !this.#application.isDestroying) {
        this.#application.destroy();
      }
    }
  }

  let customElementName = '###APPNAME###';
  if (!customElementName.includes('-')) {
    customElementName += '-app';
  }

  customElements.define(customElementName, EmbeddedApp);
})();
