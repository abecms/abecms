'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = folders;

var _recursiveFolder = require('./recursiveFolder');

var _recursiveFolder2 = _interopRequireDefault(_recursiveFolder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function folders(obj) {
  var res = (0, _recursiveFolder2.default)(obj);
  return res;
}