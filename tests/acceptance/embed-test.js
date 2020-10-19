import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | embed', function(hooks) {
  setupApplicationTest(hooks);

  test('app loads', async function(assert) {
    await visit('/');

    assert.equal(currentURL(), '/');
  });
});
