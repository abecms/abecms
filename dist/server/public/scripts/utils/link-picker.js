'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

var _popup = require('./popup');

var _popup2 = _interopRequireDefault(_popup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinkPicker = function () {
  function LinkPicker(wrapper) {
    _classCallCheck(this, LinkPicker);

    this.popup = new _popup2.default(wrapper);
    this.wrapper = wrapper;
    this.link = '';
    this.linkNode = document.createElement('input');
    this.linkNode.type = 'text';
    this.linkNode.value = '';
    this.linkNode.placeholder = 'http://example.com';

    this.btn = document.createElement('button');
    this.btn.className = 'btn btn-primary';
    this.btn.textContent = 'Add';

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(this.linkNode);
    this.wrapper.appendChild(this.btn);
    this.onLink = (0, _on2.default)(this);
  }

  _createClass(LinkPicker, [{
    key: 'bindEvt',
    value: function bindEvt() {
      var _this = this;

      var sendEvent = function sendEvent(res) {
        _this.wrapper.removeEventListener('mousedown', clickWrapper);
        document.body.removeEventListener('mousedown', cancel);
        _this.wrapper.querySelector('input').value = '';
        _this.onLink._fire(res);
        _this.popup.close();
      };
      var cancel = function cancel(e) {
        var target = e.target;
        if (!target.classList.contains('abe-popup') && !target.parentNode.classList.contains('abe-popup')) sendEvent(null);
      };
      var clickWrapper = function clickWrapper(e) {
        var link = _this.wrapper.querySelector('input').value;
        if (e.target.classList.contains('btn')) {
          sendEvent(link);
        }
      };
      this.wrapper.addEventListener('mousedown', clickWrapper);
      document.body.addEventListener('mousedown', cancel);
    }
  }, {
    key: 'show',
    value: function show(el) {
      var elBounds = el.getBoundingClientRect();
      this.popup.open(elBounds.left, elBounds.top + elBounds.height + 5);
      this.bindEvt();
    }
  }]);

  return LinkPicker;
}();

exports.default = LinkPicker;