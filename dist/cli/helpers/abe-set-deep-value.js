'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var set_deep_value = function set_deep_value(obj, is, value) {
    if (typeof is == 'string') return set_deep_value(obj, is.split('.'), value);else if (is.length == 1 && value !== undefined) return obj[is[0]] = value;else if (is.length == 0) return obj;else return set_deep_value(obj[is[0]], is.slice(1), value);
};

exports.default = set_deep_value;