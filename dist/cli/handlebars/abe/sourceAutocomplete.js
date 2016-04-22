'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sourceAutocomplete;

var _sourceAttr = require('./sourceAttr');

var _sourceAttr2 = _interopRequireDefault(_sourceAttr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sourceAutocomplete(val, params) {
  var attr = (0, _sourceAttr2.default)(val, params);
  return '<div class="autocomplete-result" value=\'' + attr.hiddenVal + '\' data-parent-id=\'' + params.key + '\' ' + attr.selected + '>\n    ' + attr.val + '\n    <span class="glyphicon glyphicon-remove" data-autocomplete-remove="true"></span>\n  </div>';
}