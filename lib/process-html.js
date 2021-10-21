const path = require('path');
const fs = require('fs');
const Plugin = require('broccoli-caching-writer');
const { JSDOM } = require('jsdom');

const INDEX_FILE = 'index.html';

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
    this.references = [];
    const html = fs.readFileSync(path.join(this.inputPaths[0], INDEX_FILE), {
      encoding: 'utf8',
    });

    const dom = new JSDOM(html);
    const document = dom.window.document;

    let customElementName = this.appName;
    if (!customElementName.includes('-')) {
      customElementName += '-app';
    }

    const customElement = document.querySelector(customElementName);
    if (!customElement) {
      this.ui.writeWarnLine(
        `ember-embedded-snippet: could not find invocation of custom element <${customElementName}>, skipping processing...`
      );
      return;
    }

    const scripts = document.querySelectorAll('script');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    this.references = [...scripts, ...styles];

    // Remove all scripts and styles from the final index.html, as those will be loaded form our embed.js script
    this.references.forEach((ref) => ref.remove());

    const embedScript = document.createElement('script');
    embedScript.setAttribute('src', `${this.rootURL}embed.js`);
    customElement.insertAdjacentElement('beforebegin', embedScript);

    fs.writeFileSync(path.join(this.outputPath, INDEX_FILE), dom.serialize(), {
      encoding: 'utf8',
    });
  }
}

module.exports = ProcessHtmlPlugin;
