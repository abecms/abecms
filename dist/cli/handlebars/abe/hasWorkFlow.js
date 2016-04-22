"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hasWorkFlow;
function hasWorkFlow(workflow, options) {
  var checkFlow = false;
  for (var prop in workflow) {
    if (workflow[prop] !== false) checkFlow = true;
  }

  if (checkFlow) return options.fn(this);
  return options.inverse(this);
}