'use strict';

const path = require('path');
const fs = require('fs');
const Plugin = require('broccoli-caching-writer');
const { JSDOM } = require('jsdom');

const INDEX_FILE = 'index.html';

// convert https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap to simple serializable pojo
function convertAttributesToObject(attributes) {
  return [...attributes].reduce(
    (hash, { name, value }) => ({ [name]: value, ...hash }),
    {}
  );
}

class ProcessHtmlPlugin extends Plugin {
  constructor(input, { appName, rootURL, ui }) {
    super([input], {
      cacheInclude: [/index\.html/],
    });
    this.appName = appName;
    this.rootURL = rootURL;
    this.ui = ui;
  }

  build() {
    if (this._processHtml()) {
      this._writeEmbedScript();
    }
  }

  _processHtml() {
    this.references = [];
    const html = fs.readFileSync(path.join(this.inputPaths[0], INDEX_FILE), {
      encoding: 'utf8',
    });

    const dom = new JSDOM(html);
    const document = dom.window.document;

    this.customElementName = this.appName;
    if (!this.customElementName.includes('-')) {
      this.customElementName += '-app';
    }

    const customElement = document.querySelector(this.customElementName);
    if (!customElement) {
      this.ui.writeWarnLine(
        `ember-embedded-snippet: could not find invocation of custom element <${this.customElementName}>, skipping processing...`
      );
      return false;
    }

    this.scripts = document.querySelectorAll(
      'script:not([data-embedded-ignore])'
    );
    this.styles = document.querySelectorAll(
      'link[rel="stylesheet"]:not([data-embedded-ignore])'
    );

    // Remove all scripts and styles from the final index.html, as those will be loaded form our embed.js script
    this.scripts.forEach((ref) => ref.remove());
    this.styles.forEach((ref) => ref.remove());

    // insert embed.js
    const embedScript = document.createElement('script');
    embedScript.setAttribute('src', `${this.rootURL}embed.js`);
    customElement.insertAdjacentElement('beforebegin', embedScript);

    fs.writeFileSync(path.join(this.outputPath, INDEX_FILE), dom.serialize(), {
      encoding: 'utf8',
    });

    return true;
  }

  _writeEmbedScript() {
    let js = fs.readFileSync(path.join(__dirname, '..', 'vendor', 'embed.js'), {
      encoding: 'utf8',
    });

    for (const [key, value] of Object.entries(this._dynamicReplacements)) {
      js = js.replace(new RegExp(`/${key}/`, 'g'), value);
      js = js.replace(new RegExp(key, 'g'), value);
    }

    fs.writeFileSync(path.join(this.outputPath, 'embed.js'), js);
  }

  get _dynamicReplacements() {
    const styles = Array.from(this.styles).map((node) =>
      convertAttributesToObject(node.attributes)
    );
    const scripts = Array.from(this.scripts).map((node) =>
      convertAttributesToObject(node.attributes)
    );

    return {
      '###APPNAME###': this.appName,
      '###CENAME###': this.customElementName,
      '###STYLES###': JSON.stringify(styles),
      '###SCRIPTS###': JSON.stringify(scripts),
    };
  }
}

module.exports = ProcessHtmlPlugin;
