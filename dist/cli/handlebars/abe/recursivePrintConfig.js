'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = recursivePrintConfig;
function recursivePrintConfig(obj) {
  var key = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  var res = '';

  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
    Array.prototype.forEach.call(Object.keys(obj), function (k) {
      var strKey = key;
      if (strKey !== '') {
        strKey += '.';
      }
      strKey += k;
      res += recursivePrintConfig(obj[k], strKey);
    });
  } else {
    res += '<div class="form-group">\n      <label class="col-sm-4 control-label" for="' + key + '">' + key + '</label>\n      <div class="col-sm-8">\n        <input type="text" class="form-control" id="' + key + '" data-json-key="' + key + '" placeholder="' + obj + '" value="' + obj + '">\n      </div>\n    </div>';
  }

  return res;
}