"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.math = math;
exports.translate = translate;

var _handlebars = require("handlebars");

var _handlebars2 = _interopRequireDefault(_handlebars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function math(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
}

function translate(lang, str) {
    var trad = Locales;
    if (typeof trad[lang] !== 'undefined' && trad[lang] !== null && typeof trad[lang][str] !== 'undefined' && trad[lang][str] !== null) {
        return trad[lang][str];
    }
    return str;
}