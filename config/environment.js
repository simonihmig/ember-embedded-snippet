'use strict';

module.exports = function(environment/*, appConfig*/) {
  return {
    locationType: environment === 'test' ? 'none' : 'hash'
  };
};
