'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = printConfig;

var _recursivePrintConfig = require('./recursivePrintConfig');

var _recursivePrintConfig2 = _interopRequireDefault(_recursivePrintConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function printConfig(obj) {
  var res = (0, _recursivePrintConfig2.default)(obj);

  return res;
}