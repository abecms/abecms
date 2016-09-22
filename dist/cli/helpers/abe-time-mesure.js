'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeMesure = function () {
  function TimeMesure(str) {
    _classCallCheck(this, TimeMesure);

    this._name = str;
    if (typeof this._name !== 'undefined' && this._name !== null) {
      console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *');
      console.log('start: ' + _cliColor2.default.green(this._name));
    }
    this._dateStart = new Date();
  }

  _createClass(TimeMesure, [{
    key: '_msToTime',
    value: function _msToTime(duration) {
      var milliseconds = parseInt(duration % 1000 / 100),
          seconds = parseInt(duration / 1000 % 60),
          minutes = parseInt(duration / (1000 * 60) % 60),
          hours = parseInt(duration / (1000 * 60 * 60) % 24);

      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }

    /**
     * Get all input from a template
     * @return {Array} array of input form
     */

  }, {
    key: 'duration',
    value: function duration(str) {
      var d = new Date(new Date().getTime() - this._dateStart.getTime()).getTime();
      if (typeof this._name === 'undefined' || this._name === null) {
        console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *');
      }
      console.log((this._name ? 'end ' + this._name : "") + "(" + _cliColor2.default.green(this._msToTime(d)) + ") " + (str ? str : ""));
    }
  }]);

  return TimeMesure;
}();

exports.default = TimeMesure;