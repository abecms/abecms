'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _colorPicker = require('./color-picker');

var _colorPicker2 = _interopRequireDefault(_colorPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RichTexarea = function () {
	function RichTexarea(wrapper, color) {
		var _this = this;

		_classCallCheck(this, RichTexarea);

		this.color = color;
		this.wrapper = wrapper;
		this.textarea = wrapper.querySelector('.form-rich');
		this.btns = this.wrapper.querySelectorAll('.wysiwyg-toolbar-icon');
		this.textEditor = wysiwyg({
			element: this.textarea,
			onKeyDown: function onKeyDown(key, character, shiftKey, altKey, ctrlKey, metaKey) {},
			onKeyPress: function onKeyPress(key, character, shiftKey, altKey, ctrlKey, metaKey) {},
			onKeyUp: function onKeyUp(key, character, shiftKey, altKey, ctrlKey, metaKey) {
				_this.setHTML();
			},
			onSelection: function onSelection(collapsed, rect, nodes, rightclick) {},
			onPlaceholder: function onPlaceholder(visible) {},
			onOpenpopup: function onOpenpopup() {},
			onClosepopup: function onClosepopup() {},
			hijackContextmenu: false
		});

		this._action = this.action.bind(this);
		Array.prototype.forEach.call(this.btns, function (btn) {
			btn.addEventListener('click', _this._action);
		});
	}

	_createClass(RichTexarea, [{
		key: 'setHTML',
		value: function setHTML() {
			this.textarea.innerHTML = this.textEditor.getHTML();
			var evt = document.createEvent("KeyboardEvent");
			evt.initKeyboardEvent("keyup", true, true, window, 0, 0, 0, 0, 0, "e".charCodeAt(0));
			var canceled = !this.textarea.dispatchEvent(evt);
		}
	}, {
		key: 'action',
		value: function action(e) {
			var _this2 = this;

			this.el = e.target;
			if (this.el.tagName.toLowerCase() === 'span') this.el = this.el.parentNode;

			this.action = this.el.getAttribute('data-action');
			this.popup = this.el.getAttribute('data-popup');
			this.param = this.el.getAttribute('data-param');
			if (typeof this.popup !== 'undefined' && this.popup !== null) {
				switch (this.popup) {
					case 'color':
						console.log('this.color', this.color);
						var off = this.color.onColor(function (color) {
							_this2.textEditor[_this2.action](color);
							_this2.setHTML();
							off();
						});
						this.color.show(this.el);
						break;
				}
			} else {
				this.textEditor[this.action](this.param);
				this.setHTML();
			}
		}
	}]);

	return RichTexarea;
}();

exports.default = RichTexarea;