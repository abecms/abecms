'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ifIn;
function ifIn(actions, currentAction, options) {
  for (var action in actions) {
    if (action === currentAction) return options.fn(this);
  }
  return '';
}