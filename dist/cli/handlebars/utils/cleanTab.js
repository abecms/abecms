'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cleanTab;

var _ = require('../../');

function cleanTab(obj) {
  obj = _.Util.replaceUnwantedChar(obj.replace(/ |&/g, '_'));

  return obj;
}