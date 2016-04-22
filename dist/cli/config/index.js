'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.abeConfigLocal = exports.abeConfig = undefined;

var _abeConfig = require('./abe-config');

var _abeConfig2 = _interopRequireDefault(_abeConfig);

var _abeConfigLocal = require('./abe-config-local');

var _abeConfigLocal2 = _interopRequireDefault(_abeConfigLocal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var abeConfig = _abeConfig2.default;
var abeConfigLocal = _abeConfigLocal2.default;

exports.abeConfig = _abeConfig2.default;
exports.abeConfigLocal = _abeConfigLocal2.default;