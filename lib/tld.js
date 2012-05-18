"use strict";

function tld (){
  this.rules = [];
}

tld.init = function () {
  return new tld();
};

tld.prototype.getDomain = function (uri) {

};

module.exports = tld;