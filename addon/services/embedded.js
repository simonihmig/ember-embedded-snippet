import Service from '@ember/service';
import { getOwner } from '@ember/application';

export default class EmbeddedService extends Service {
  /**
   * The host name of our origin server, where the embedded app itself is hosted
   *
   * @property originHost
   * @type string
   * @public
   */
  get originHost() {
    let scriptTag = document.querySelector('script[src$="/embed.js"]');

    return scriptTag
      ? scriptTag.src.replace(/(https?:\/\/.*?)\/.*/g, '$1')
      : undefined;
  }

  get args() {
    if (!this._args) {
      // eslint-disable-next-line ember/no-side-effects
      this._args = getOwner(this).resolveRegistration('config:embedded');
    }

    return this._args;
  }
}
