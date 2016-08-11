'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var deep_value = function deep_value(obj, path) {

  if (path.indexOf('.') === -1) {
    return typeof obj[path] !== 'undefined' && obj[path] !== null ? obj[path] : null;
  }

  var pathSplit = path.split('.');
  var res = JSON.parse(JSON.stringify(obj));

  while (pathSplit.length > 0) {

    if (typeof res[pathSplit[0]] !== 'undefined' && res[pathSplit[0]] !== null) {
      if (_typeof(res[pathSplit[0]]) === 'object' && Object.prototype.toString.call(res[pathSplit[0]]) === '[object Array]') {
        var resArray = [];

        Array.prototype.forEach.call(res[pathSplit[0]], function (item) {
          resArray.push(deep_value(item, pathSplit.join('.').replace(pathSplit[0] + '.', '')));
        });
        res = resArray;
        pathSplit.shift();
      } else {
        res = res[pathSplit[0]];
      }
    } else {
      return null;
    }
    pathSplit.shift();
  }

  return res;
};

exports.default = deep_value;