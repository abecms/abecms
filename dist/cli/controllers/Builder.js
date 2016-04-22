'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Builder = function Builder() {
  _classCallCheck(this, Builder);
};

exports.default = Builder;