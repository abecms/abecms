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

    this.checkboxes = document.createElement('div');
    this.checkboxes.classList.add('coche');
    this.checkboxes.classList.add('keep-popup');

    this.noFollowLabel = document.createElement('label');
    this.noFollowLabel.textContent = 'no-follow';
    this.noFollowLabel.classList.add('keep-popup');
    this.noFollow = document.createElement('input');
    this.noFollow.type = "checkbox";
    this.noFollow.name = "no-follow-" + parseInt(Math.random() * 100);
    this.noFollow.classList.add('keep-popup');

    this.targetLabel = document.createElement('label');
    this.targetLabel.textContent = 'target blank';
    this.targetLabel.classList.add('keep-popup');
    this.target = document.createElement('input');
    this.target.type = "checkbox";
    this.target.name = "target-" + parseInt(Math.random() * 100);
    this.target.classList.add('keep-popup');

    this.noFollowLabel.appendChild(this.noFollow);
    this.targetLabel.appendChild(this.target);
    this.checkboxes.appendChild(this.noFollowLabel);
    this.checkboxes.appendChild(this.targetLabel);

    this.btn = document.createElement('button');
    this.btn.className = 'btn btn-primary';
    this.btn.textContent = 'Add';

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(this.linkNode);
    this.wrapper.appendChild(this.btn);
    this.wrapper.appendChild(this.checkboxes);
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
        _this.noFollow.checked = false;
        _this.target.checked = false;
        _this.onLink._fire(res);
        _this.popup.close();
      };
      var cancel = function cancel(e) {
        var target = e.target;
        if (!target.classList.contains('abe-popup') && !target.parentNode.classList.contains('keep-popup') && !target.parentNode.classList.contains('abe-popup')) {
          sendEvent(null);
        }
      };
      var clickWrapper = function clickWrapper(e) {
        var link = _this.wrapper.querySelector('input').value;
        if (e.target.classList.contains('btn')) {
          sendEvent({ link: link, target: _this.target.checked, noFollow: _this.noFollow.checked });
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