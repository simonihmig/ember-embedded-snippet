ember-embedded-snippet
==============================================================================

![CI](https://github.com/kaliber5/ember-embedded-snippet/workflows/CI/badge.svg)

Embed your Ember app as a WebComponent into external pages with a simple JavaScript snippet.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
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
<script src="https://www.your-deployed-ember-app.com/embed.js"></script>
<my-app-name></my-app-name>
```

`my-app-name` is the name of your app. As custom elements require to contain a dash, if your app name is a single word, append the `-app` suffix.

### Shadow DOM

To prevent styles leaking from the parent page into your app or vice versa, you can enable [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) support:

```html
<my-app-name shadow></my-app-name>
```

> Note that even with shadow DOM, inherited styles will also be inherited by your shadow DOM, thus leak into your app. 
> So you might want to [reset inheritable styles](https://developers.google.com/web/fundamentals/web-components/shadowdom#reset)



Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
