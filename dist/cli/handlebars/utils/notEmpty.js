'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = notEmpty;

/**
 */
function notEmpty(variable) {
  if (typeof variable !== 'undefined' && variable !== null && variable !== '') {
    return block.fn(this);
  } else {
    return '';
  }
}