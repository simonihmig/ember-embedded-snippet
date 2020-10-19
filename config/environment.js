'use strict';

module.exports = function(environment/*, appConfig */) {
  return {
    locationType: 'hash',
    exportApplicationGlobal: 'emberEmbeddedApp',
    embedded: {
      delegateStart: environment !== 'test'
    }
  };
};
