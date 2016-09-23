'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = sourceAttr;

var _ = require('../../');

function sourceAttr(val, params) {
  var hiddenVal = val;
  var selected = '';

  if ((typeof hiddenVal === 'undefined' ? 'undefined' : _typeof(hiddenVal)) === 'object' && Object.prototype.toString.call(hiddenVal) === '[object Object]') {
    hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, "&apos;");

    try {
      var displayVal = eval('val.' + params.display);
      if (typeof params.display !== 'undefined' && params.display !== null && typeof displayVal !== 'undefined' && displayVal !== null) {
        val = displayVal;
      } else {
        val = val[Object.keys(val)[0]];
      }
    } catch (e) {
      val = val[Object.keys(val)[0]];
    }
  }

  if (_typeof(params.value) === 'object' && Object.prototype.toString.call(params.value) === '[object Array]') {
    Array.prototype.forEach.call(params.value, function (v) {
      var item = v;
      try {
        var displayV = eval('item.' + params.display);
        if (typeof params.display !== 'undefined' && params.display !== null && typeof displayV !== 'undefined' && displayV !== null) {
          item = displayV;
        } else {
          if (typeof v === 'string') {
            item = v;
          } else {
            item = v[Object.keys(v)[0]];
          }
        }
      } catch (e) {
        item = v[Object.keys(v)[0]];
      }

      if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && Object.prototype.toString.call(val) === '[object Array]' && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && Object.prototype.toString.call(item) === '[object Array]') {

        Array.prototype.forEach.call(item, function (i) {
          if (val.includes(i)) {
            selected = 'selected="selected"';
          }
        });
      } else if (val === item) {
        selected = 'selected="selected"';
      }
    });
  } else if (params.value === hiddenVal) {
    selected = 'selected="selected"';
  }

  return {
    hiddenVal: hiddenVal,
    selected: selected,
    val: val
  };
}