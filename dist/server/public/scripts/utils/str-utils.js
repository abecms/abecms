"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StrUtils = function () {
  function StrUtils() {
    _classCallCheck(this, StrUtils);
  }

  _createClass(StrUtils, null, [{
    key: "escapeRegExp",
    value: function escapeRegExp(str) {
      var specials = [
      // order matters for these
      "-", "[", "]"
      // order doesn't matter for any of these
      , "/", "{", "}", "(", ")", "*", "+", "?", ".", "\\", "^", "$", "|"]

      // I choose to escape every character with '\'
      // even though only some strictly require it when inside of []
      ,
          regex = RegExp('[' + specials.join('\\') + ']', 'g');
      return str.replace(regex, "\\$&");
    }
  }]);

  return StrUtils;
}();

exports.default = StrUtils;