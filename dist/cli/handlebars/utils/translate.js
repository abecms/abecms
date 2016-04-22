'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = translate;

var _ = require('../../');

function translate(lang, str) {
  var trad = _.Locales.instance.i18n;
  if (typeof trad[lang] !== 'undefined' && trad[lang] !== null && typeof trad[lang][str] !== 'undefined' && trad[lang][str] !== null) {
    return trad[lang][str];
  }
  return str;
}