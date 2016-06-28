'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanSlug = undefined;

var _cli = require('../../cli');

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
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.replace(/  +/g, '-');
  var chars = { ' ': '-', '^': '', '<': '', '>': '', '=': '', ',': '', ';': '', '/': '', ':': '', '@': '', '!': '', "’": '', "'": '', '\"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y' };
  str = str.replace(/\(|\)|\[|\]|\/|\\|\*|\+|\?/g, '');
  for (var prop in chars) {
    str = str.replace(new RegExp(prop, 'g'), chars[prop]);
  }
  return str.toLowerCase();
}

exports.cleanSlug = cleanSlug;
exports.default = slugify;