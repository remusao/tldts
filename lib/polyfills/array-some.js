// Array.some() polyfill for IE8
module.exports = function _someFunction(value, fun /*, thisArg */) {
    'use strict';

    if (value === void 0 || value === null) {
      throw new TypeError();
    }

    var t = Object(value);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var thisArg = arguments.length >= 3 ? arguments[2] : void 0;
    for (var i = 0; i < len; i++)
    {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true;
      }
    }

    return false;
};
