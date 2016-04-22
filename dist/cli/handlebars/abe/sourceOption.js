'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sourceOption;

var _sourceAttr = require('./sourceAttr');

var _sourceAttr2 = _interopRequireDefault(_sourceAttr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sourceOption(val, params) {
  var attr = (0, _sourceAttr2.default)(val, params);
  return '<option value=\'' + attr.hiddenVal + '\' ' + attr.selected + '>' + attr.val + '</option>';
}