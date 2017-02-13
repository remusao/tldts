// Array.map polyfill for IE8
module.exports = function _mapFunction(thisVal, fun /*, thisArg */) {
  "use strict";

  if (thisVal === void 0 || thisVal === null) {
    throw new TypeError();
  }

  var t = Object(thisVal);
  var len = t.length >>> 0;
  if (typeof fun !== "function") {
    throw new TypeError();
  }

  var res = new Array(len);
  var thisArg = arguments.length >= 3 ? arguments[2] : void 0;

  for (var i = 0; i < len; i++)
  {
    // NOTE: Absolute correctness would demand Object.defineProperty
    //       be used.  But this method is fairly new, and failure is
    //       possible only if Object.prototype or Array.prototype
    //       has a property |i| (very unlikely), so use a lesscorrect
    //       but more portable alternative.
    if (i in t) {
      res[i] = fun.call(thisArg, t[i], i, t);      
    }
  }

  return res;
};
