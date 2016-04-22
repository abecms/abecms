"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = moduloIf;

/**
 * Handlebars helper, conditionnal modulo
 * @param  {Int} num number to test
 * @param  {Int} mod modulo number
 * @param  {String} block text block content inside of {{#moduloIf}} ... {{/moduloIf}}
 * @return {String|html} if true return the block compiled by handlebar inside our template, if not void
 */
function moduloIf(num, mod, block) {
  if (parseInt(num + 1) % parseInt(mod) === 0) {
    return block.fn(this);
  }
}