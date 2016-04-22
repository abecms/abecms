'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prettyjson = require('prettyjson');

var _prettyjson2 = _interopRequireDefault(_prettyjson);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CliUtils = function () {
  function CliUtils() {
    _classCallCheck(this, CliUtils);
  }

  _createClass(CliUtils, null, [{
    key: 'table',
    value: function table(arr) {
      var vertical = {};

      // instantiate
      var tab = new _cliTable2.default();

      var i = '0';
      Array.prototype.forEach.call(arr, function (value) {
        var obj = {};
        obj['item-' + i++] = value;
        tab.push(obj);
      });

      console.log(tab.toString());
    }
  }, {
    key: 'json',
    value: function json(obj) {
      console.log(_prettyjson2.default.render(obj));
    }
  }]);

  return CliUtils;
}();

exports.default = CliUtils;