ember-embedded-snippet
==============================================================================

![CI](https://github.com/kaliber5/ember-embedded-snippet/workflows/CI/badge.svg)

Ember your Ember app into external pages with a simple JavaScript snippet.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.16 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-embedded-snippet
```


Usage
------------------------------------------------------------------------------

Add a snippet like this to your static or server rendered HTML page:

```html
<div id="embedded"></div>
<script src="https://www.your-deployed-ember-app.com/embed.js"></script>
<script type="text/javascript">
  emberEmbeddedSnippet({
    root: '#embedded',
  });
</script>
```

### Config

The following configuration options can be passed to the `emberEmbeddedSnippet()` call:

* `root`: CSS selector used to render the app into. See also [Changing the Root Element](https://guides.emberjs.com/release/configuring-ember/embedding-applications/#toc_changing-the-root-element).
* `host`: The host to use for loading the app's assets (JS and CSS), e.g. `https://www.example.com`. Optional, by default the host will be extracted from the script element referencing the `embed.js` script, see the example above.
* `debug`: add debugging output
* `options`: will be added to your APP config, see https://github.com/peopledoc/ember-cli-embedded


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
