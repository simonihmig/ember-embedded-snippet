import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service
  embedded;

  // we intentionally do this eagerly, so we can catch in tests that args are available as early as the initial render!
  args = this.embedded.args;
}
