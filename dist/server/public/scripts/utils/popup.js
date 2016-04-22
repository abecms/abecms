'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Popup = function () {
  function Popup(wrapper) {
    _classCallCheck(this, Popup);

    this.wrapper = wrapper;
    this.wrapper.classList.add('abe-popup');
  }

  _createClass(Popup, [{
    key: 'open',
    value: function open() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      this.wrapper.style.left = x + 'px';
      this.wrapper.style.top = y + 'px';
      if (!this.wrapper.classList.contains('on')) this.wrapper.classList.add('on');
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.wrapper.classList.contains('on')) this.wrapper.classList.remove('on');
    }
  }]);

  return Popup;
}();

exports.default = Popup;