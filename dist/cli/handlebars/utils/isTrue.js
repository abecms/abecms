'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isTrue;
function isTrue(v1, operator, v2) {
  switch (operator) {
    case '==':
      return v1 == v2;
    case '===':
      return v1 === v2;
    case '<':
      return v1 < v2;
    case '<=':
      return v1 <= v2;
    case '>':
      return v1 > v2;
    case '>=':
      return v1 >= v2;
    case '&&':
      return v1 && v2;
    case '||':
      return v1 || v2;
    default:
      return false;
  }
}