'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = slugify;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * slugify string
 * @param  {String} string to convert
 * @return {String} slug string
 */
function slugify(str) {
  if (typeof str === 'undefined' || str === null) return '';
  var chars = { ' ': '-', '@': '', '!': '', "’": '', "'": '', '\"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y' };
  str = str.replace(/\(|\)|\[|\]|\*/g, '');
  for (var prop in chars) {
    str = str.replace(new RegExp(prop, 'g'), chars[prop]);
  }return str.toLowerCase();
}