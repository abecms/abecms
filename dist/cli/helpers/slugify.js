'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanSlug = undefined;

var _limax = require('limax');

var _limax2 = _interopRequireDefault(_limax);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cleanSlug(str) {

  if (typeof str === 'undefined' || str === null) return null;
  if (str.indexOf('.') === -1) {
    // no extension add one
    str = str + '.' + _cli.config.files.templates.extension;
  }
  str = str.split('/');
  str[str.length - 1] = slugify(decodeURIComponent(str[str.length - 1]));
  return str.join('/');
}

function slugify(str) {
  str = _cli.fileUtils.removeExtension(str);
  str = (0, _limax2.default)(str);
  str = str + '.' + _cli.config.files.templates.extension;
  return str.toLowerCase();
}

exports.cleanSlug = cleanSlug;
exports.default = slugify;