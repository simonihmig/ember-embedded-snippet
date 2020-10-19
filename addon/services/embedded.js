import Service from '@ember/service';
import { computed } from '@ember/object';

export default class EmbeddedService extends Service {

  /**
   * The host name of our origin server, where the embedded app itself is hosted
   *
   * @property originHost
   * @type string
   * @public
   */
  @computed()
  get originHost() {
    let scriptTag = document.querySelector('script[src$="/embed.js"]');

    return scriptTag ? scriptTag.src.replace(/(https?:\/\/.*?)\/.*/g, '$1') : undefined;
  }

}
