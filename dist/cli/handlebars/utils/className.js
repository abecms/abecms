'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = className;

/**
 * Handlebars helper, to print className and escape it string
 */
function className(str) {
  return str.replace(/\.| |\#/g, '_');
}