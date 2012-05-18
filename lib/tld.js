"use strict";

function tld (){
  this.tlds = [];
}

tld.init = function (options) {
  return new tld(options);
};

tld.prototype.getDomain = function (uri) {

};

module.exports = tld;