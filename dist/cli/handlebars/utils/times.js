'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = times;
function times(n, block) {
  n = parseInt(n);
  var accum = '';
  for (var i = 0; i < n; ++i) {
    accum += block.fn(i);
  }return accum;
}