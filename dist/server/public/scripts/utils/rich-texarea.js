'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RichTexarea = function () {
	function RichTexarea(wrapper, color, link) {
		var _this = this;

		_classCallCheck(this, RichTexarea);

		this.color = color;
		this.link = link;
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
		key: '_replaceSelectionWithHtml',
		value: function _replaceSelectionWithHtml(html) {
			var range, html;
			if (window.getSelection && window.getSelection().getRangeAt) {
				range = window.getSelection().getRangeAt(0);
				range.deleteContents();
				var div = document.createElement("div");
				div.innerHTML = html;
				var frag = document.createDocumentFragment(),
				    child;
				while (child = div.firstChild) {
					frag.appendChild(child);
				}
				range.insertNode(frag);
			} else if (document.selection && document.selection.createRange) {
				range = document.selection.createRange();
				html = node.nodeType == 3 ? node.data : node.outerHTML;
				range.pasteHTML(html);
			}
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
						var off = this.color.onColor(function (color) {
							if (color !== null) {
								_this2.textEditor[_this2.action](color);
								_this2.setHTML();
							}
							off();
						});
						this.color.show(this.el);
						break;
					case 'link':
						var html = this.textEditor.getHTML();
						this._replaceSelectionWithHtml('<a href="[LINK]">' + window.getSelection().toString() + '</a>');
						var off = this.link.onLink(function (link) {
							if (link !== null) _this2.textEditor.setHTML(_this2.textEditor.getHTML().replace('[LINK]', link));else _this2.textEditor.setHTML(html);
							_this2.setHTML();
							off();
						});
						this.link.show(this.el);
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