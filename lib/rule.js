"use strict";

/*jshint node:true strict: true */

function Rule (data){
  data = data || {};

  this.exception = data.exception || false;
  this.firstLevel = data.firstLevel || '';
  this.secondLevel = data.secondLevel || null;
  this.source = data.source || '';
  this.wildcard = data.wildcard || false;
}

Rule.prototype.getNormalXld = function getNormalXld(){
  return (this.secondLevel ? '.' + this.secondLevel : '') + '.' + this.firstLevel;
};

Rule.prototype.getNormalPattern = function getNormalPattern(){
  return (this.secondLevel ? '\\.' + this.secondLevel : '') + '\\.' + this.firstLevel;
};

Rule.prototype.getWildcardPattern = function getWildcardPattern(){
  return '\\.[^\\.]+' + this.getNormalXld();
};

Rule.prototype.getExceptionPattern = function getExceptionPattern(){
  return (this.secondLevel || '') + '\\.' + this.firstLevel;
};

Rule.prototype.getPattern = function getPattern(){
  if (this.exception === true){
    return '(' + this.getExceptionPattern() + ')$';
  }
  else if (this.wildcard === true){
    return '([^\\.]+' + this.getWildcardPattern() + ')$';
  }
  else{
    return '([^\\.]+' + this.getNormalPattern() + ')$';
  }
};

module.exports = Rule;