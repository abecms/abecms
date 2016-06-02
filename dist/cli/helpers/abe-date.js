'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dateSlug = dateSlug;
exports.dateUnslug = dateUnslug;

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dateSlug(date) {
  return date.replace(/[-:\.]/g, '');
}

function dateUnslug(date, file) {
  if (date.indexOf(':') > -1 || date.indexOf('-') > -1 || date.indexOf('.') > -1) {
    console.log(_cliColor2.default.green('[ WARNING ] you have old file architecture'), file);
    return date;
  }
  var res = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 11) + ':' + date.substring(11, 13) + ':' + date.substring(13, 15) + '.' + date.substring(15, 19);
  return res;
}