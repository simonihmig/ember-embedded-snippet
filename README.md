ember-embedded-snippet
==============================================================================

![CI](https://github.com/kaliber5/ember-embedded-snippet/workflows/CI/badge.svg)

Embed your Ember app as a WebComponent into external pages with a simple JavaScript snippet.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.16 or above
* Ember CLI v3.20 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-embedded-snippet
```

To allow compatibility with `ember-auto-import` v2 and Embroider, since `v0.7.0` the addon requires some manual 
setup to postprocess Ember's build.

In your `ember-cli-build.js` change the last part:

```js
module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    // ...
  });

-  return app.toTree();
+  return require('ember-embedded-snippet').process(app, app.toTree());
}
```

Then you should also add the custom element invocation to your `app/index.html`, so when running locally using `ember serve`
the app is bootstrapped the same way as when it is embedded in production. See also the "Usage" below!

```html
  <body>
    {{content-for "body"}}

+    <my-app-name></my-app-name>
    
    <script src="{{rootURL}}assets/vendor.js"></script>
    <script src="{{rootURL}}assets/<%= name %>.js"></script>

    {{content-for "body-footer"}}
  </body>
```

> Note: doing this also for `tests/index.html` will not work, you should keep that file as-is. That means tests use the default
> bootstrapping process of Ember.

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

### Custom arguments

Any other attributes added to the custom element are taken as custom arguments, that you can read from the `embedded` service's `args` property:

```html
<my-app-name foo="bar" enable-foo></my-app-name>
```

```js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class FooController extends Controller {
  @service
  embedded;
  
  get foo() {
    return this.embedded.args.hasOwnProperty('enable-foo') ? this.embedded.args.foo : null;
  }
}
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
