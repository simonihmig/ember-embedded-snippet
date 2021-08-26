/* global require */

(function () {
  function debug(msg) {
    console.debug('[ember-embedded-snippet] %s', msg);
  }

  function injectScript(src, head) {
    return new Promise((resolve) => {
      let scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.src = src;
      scriptTag.onload = resolve;
      debug('Injecting script: ' + src);
      head.appendChild(scriptTag);
    });
  }

  async function injectScripts(jsUrls, head) {
    for (let src of jsUrls) {
      await injectScript(src, head);
    }
  }

  function injectStyles(cssUrls, head) {
    cssUrls.forEach((src) => {
      let cssSelector = "link[href='" + src + "']";

      if (head.querySelector(cssSelector) === null) {
        let cssLink = document.createElement('link');
        cssLink.setAttribute('rel', 'stylesheet');
        cssLink.setAttribute('type', 'text/css');
        cssLink.setAttribute('href', src);
        debug('Injecting style: ' + src);
        head.appendChild(cssLink);
      }
    });
  }

  async function setup(head, host) {
    if (!host) {
      // Fetch host from our own script tag
      let scriptTag = document.querySelector('script[src$="/embed.js"]');
      if (!scriptTag)
        throw new Error('ember-embedded-snippet: Cannot find own script tag');

      host = scriptTag.src.replace(/(https?:\/\/.*?)\/.*/g, '$1');
    }

    host = host.replace(/\/$/, '');

    let cssUrls = [
      prependHostIfRequired('/assets/vendor.css', host),
      prependHostIfRequired('/assets/###APPNAME###.css', host),
    ];

    injectStyles(cssUrls, head);

    let jsUrls = [
      prependHostIfRequired('/assets/vendor.js', host),
      prependHostIfRequired('/assets/###APPNAME###.js', host),
    ];

    await injectScripts(jsUrls, head);
  }

  function prependHostIfRequired(url, host) {
    return url.match(/^https?:\/\/.*/) ? url : host + url;
  }

  async function startApp(rootElement, config = {}) {
    debug(`Starting ember app "###APPNAME###"`);

    return require('###APPNAME###/app').default.create({
      rootElement,
      config,
    });
  }

  // list all attributes to our CE that we handle by ourself. All others are passed as custom arguments to the app...
  const ownAttributes = ['shadow', 'class'];

  class EmbeddedApp extends HTMLElement {
    #rootElement;
    #application;
    #shadowRoot;

    async connectedCallback() {
      if (this.#application) {
        return;
      }

      let head;
      if (this.getAttribute('shadow') !== null) {
        this.#shadowRoot = this.attachShadow({ mode: 'open' });
        const rootParent = document.createElement('div');
        const rootElement = document.createElement('div');
        rootParent.appendChild(rootElement);
        this.#shadowRoot.appendChild(rootParent);
        this.#rootElement = rootElement;
        head = rootParent;
      } else {
        this.#rootElement = this;
        head = this;
      }

      await setup(head);

      window.__ember_embedded_snippet_args = this.customArgs;

      this.#application = await startApp(this.#rootElement);
    }

    disconnectedCallback() {
      if (
        this.#application &&
        !this.#application.isDestroyed &&
        !this.#application.isDestroying
      ) {
        this.#application.destroy();
      }
    }

    get customArgs() {
      const args = this.getAttributeNames()
        .filter((attr) => !ownAttributes.includes(attr))
        .reduce(
          (args, attr) => ({ ...args, [attr]: this.getAttribute(attr) }),
          {}
        );

      return Object.freeze(args);
    }
  }

  let customElementName = '###APPNAME###';
  if (!customElementName.includes('-')) {
    customElementName += '-app';
  }

  customElements.define(customElementName, EmbeddedApp);
})();
