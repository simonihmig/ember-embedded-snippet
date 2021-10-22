/* global globalThis */
import { module, test } from 'qunit';

function waitFor(
  selector,
  { timeout = 1000, delay = 10, doc = document } = {}
) {
  return new Promise((resolve, reject) => {
    if (!doc) {
      reject(new Error('No valid document passed'));
      return;
    }
    const wait = (timeout) => {
      setTimeout(() => {
        if (doc.querySelector(selector)) {
          resolve();
        } else {
          const remainingTimeout = (timeout -= delay);
          if (remainingTimeout <= 0) {
            reject(new Error(`Timed out searching for ${selector}`));
          } else {
            wait(remainingTimeout);
          }
        }
      }, delay);
    };

    wait(timeout);
  });
}

module('Acceptance | embed', function (hooks) {
  hooks.before(function () {
    // Remove styles for leaking styles test.
    // We cannot remove them from tests/index.html unfortunatly, as Embroider won't allow this
    document.querySelector('link[href$="dummy.css"]').remove();
  });

  hooks.beforeEach(function () {
    // With the way we load the JS when bootstrapping our embedded app every time, Glimmer thinks we are including
    // `@glimmer/validator` twice, which is not the case. Using this workaround here to silence the assertion.
    // This shouldn't be an issue in production as long as we are not loading vendor.js twice, only happening here
    // because of our test setup (needing vendor.js for test infrastructure, but also loading it again in tests during
    // embedded bootstrapping)
    // See also https://github.com/glimmerjs/glimmer-vm/issues/1252
    globalThis[Symbol.for('GLIMMER_VALIDATOR_REGISTRATION')] = false;
  });

  hooks.afterEach(function () {
    document.querySelector('#ember-testing').innerHTML = '';
  });

  module('no shadowDOM', function () {
    test('app loads', async function (assert) {
      const ce = document.createElement('dummy-app');
      document.querySelector('#ember-testing').appendChild(ce);

      await waitFor('dummy-app .title');

      assert.dom('dummy-app .title').hasText('Welcome to Ember');
    });

    test('parent styles do leak into embedded app', async function (assert) {
      const ce = document.createElement('dummy-app');
      document.querySelector('#ember-testing').appendChild(ce);

      await waitFor('dummy-app .title');

      assert.dom('dummy-app .title').hasStyle({
        color: 'rgb(255, 0, 0)',
      });
    });

    test('embedded styles do leak into parent', async function (assert) {
      const ce = document.createElement('dummy-app');
      document.querySelector('#ember-testing').appendChild(ce);

      const parentEl = document.createElement('button');
      parentEl.classList.add('something');
      document.querySelector('#ember-testing').appendChild(parentEl);

      await waitFor('dummy-app .title');

      assert.dom('.something').hasStyle({
        color: 'rgb(0, 0, 255)',
      });
    });
  });

  module('shadowDOM', function () {
    test('app loads', async function (assert) {
      const ce = document.createElement('dummy-app');
      ce.setAttribute('shadow', '');
      document.querySelector('#ember-testing').appendChild(ce);

      await waitFor('dummy-app');
      const shadowRoot = document.querySelector('dummy-app').shadowRoot;
      assert.ok('Expected shadow root', !!shadowRoot);
      await waitFor('.title', { doc: shadowRoot });

      assert.dom('.title', shadowRoot).hasText('Welcome to Ember');
    });

    test("parent styles don't leak into embedded app", async function (assert) {
      const ce = document.createElement('dummy-app');
      ce.setAttribute('shadow', '');
      document.querySelector('#ember-testing').appendChild(ce);

      await waitFor('dummy-app');
      const shadowRoot = document.querySelector('dummy-app').shadowRoot;
      assert.ok('Expected shadow root', !!shadowRoot);
      await waitFor('.title', { doc: shadowRoot });

      assert.dom('.title', shadowRoot).hasStyle({
        color: 'rgb(0, 0, 255)',
      });
    });

    test("embedded styles don't leak into parent", async function (assert) {
      const ce = document.createElement('dummy-app');
      ce.setAttribute('shadow', '');
      document.querySelector('#ember-testing').appendChild(ce);

      const parentEl = document.createElement('button');
      parentEl.classList.add('something');
      document.querySelector('#ember-testing').appendChild(parentEl);

      await waitFor('dummy-app');
      const shadowRoot = document.querySelector('dummy-app').shadowRoot;
      assert.ok('Expected shadow root', !!shadowRoot);
      await waitFor('.title', { doc: shadowRoot });

      assert.dom('.something').hasStyle({
        color: 'rgb(255, 0, 0)',
      });
    });
  });

  module('service', function () {
    test('custom arguments are exposed on service', async function (assert) {
      const ce = document.createElement('dummy-app');
      ce.setAttribute('foo', '1');
      ce.setAttribute('bar', '2');
      document.querySelector('#ember-testing').appendChild(ce);

      await waitFor('dummy-app .title');

      assert.dom('[data-test-arg]').exists({ count: 2 });
      assert.dom('[data-test-arg="foo"]').hasText('1');
      assert.dom('[data-test-arg="bar"]').hasText('2');
    });
  });
});
