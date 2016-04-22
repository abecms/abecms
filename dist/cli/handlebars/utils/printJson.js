"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = printJson;

/**
 * Handlebars helper, to print json object
 */
function printJson(obj, escapeString) {
  return typeof escapeString !== null && escapeString !== null && escapeString === 1 ? escape(JSON.stringify(obj).replace(/'/g, "%27")) : JSON.stringify(obj).replace(/'/g, "%27");
}