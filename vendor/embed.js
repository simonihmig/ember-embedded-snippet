/* global require */

(function () {
  function debug(msg) {
    console.debug('[ember-embedded-snippet] %s', msg);
  }

  function injectScript(script, head, host) {
    return new Promise((resolve) => {
      let scriptTag = document.createElement('script');
      let hasSrc = false;
      for (let [name, value] of Object.entries(script.attributes)) {
        if (name === 'src') {
          value = prependHostIfRequired(value, host);
          hasSrc = true;
          scriptTag.onload = resolve;
          debug('Injecting script: ' + value);
        }
        scriptTag.setAttribute(name, value);
      }
      if (script.content) {
        scriptTag.textContent = script.content;
      }
      scriptTag.defer = true;
      scriptTag.async = false;

      head.appendChild(scriptTag);
      if (!hasSrc) {
        resolve();
      }
    });
  }

  async function injectScripts(scripts, head, host) {
    await Promise.all(
      scripts.map((script) => injectScript(script, head, host))
    );
  }

  function injectLinks(links, head, host) {
    for (const style of links) {
      let cssSelector = `link[href="${style.attributes.href}"]`;

      if (head.querySelector(cssSelector) !== null) {
        return;
      }

      let cssLink = document.createElement('link');
      for (let [name, value] of Object.entries(style.attributes)) {
        if (name === 'href') {
          value = prependHostIfRequired(value, host);
          debug('Injecting style: ' + value);
        }
        cssLink.setAttribute(name, value);
      }
      head.appendChild(cssLink);
    }
  }

  function injectStyles(styles, head) {
    for (const style of styles) {
      let styleNode = document.createElement('style');
      for (let [name, value] of Object.entries(style.attributes)) {
        styleNode.setAttribute(name, value);
      }
      if (style.content) {
        styleNode.textContent = style.content;
      }
      head.appendChild(styleNode);
    }
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

    const links = /###LINKS###/;
    const scripts = /###SCRIPTS###/;
    const styles = /###STYLES###/;

    injectLinks(links, head, host);
    injectStyles(styles, head);
    await injectScripts(scripts, head, host);
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

  let definition = customElements.get('###CENAME###');

  if (definition == null) {
    customElements.define('###CENAME###', EmbeddedApp);
  }
})();
