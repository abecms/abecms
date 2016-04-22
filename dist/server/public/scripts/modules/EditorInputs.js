'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EditorUtils = require('../modules/EditorUtils');

var _EditorUtils2 = _interopRequireDefault(_EditorUtils);

var _EditorJson = require('../modules/EditorJson');

var _EditorJson2 = _interopRequireDefault(_EditorJson);

var _EditorSave = require('../modules/EditorSave');

var _EditorSave2 = _interopRequireDefault(_EditorSave);

var _iframe = require('../utils/iframe');

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _richTexarea = require('../utils/rich-texarea');

var _richTexarea2 = _interopRequireDefault(_richTexarea);

var _colorPicker = require('../utils/color-picker');

var _colorPicker2 = _interopRequireDefault(_colorPicker);

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorInputs = function () {
  function EditorInputs() {
    _classCallCheck(this, EditorInputs);

    this._ajax = _nanoajax2.default.ajax;
    this._json = _EditorJson2.default.instance;
    this.color = new _colorPicker2.default(document.querySelector('.wysiwyg-popup'));
    this.onBlur = (0, _on2.default)(this);
    this.onReload = (0, _on2.default)(this);
    this.onDisableInput = (0, _on2.default)(this);

    this._inputElements();
  }

  _createClass(EditorInputs, [{
    key: 'rebind',
    value: function rebind() {
      var _this = this;

      this._reloads = [].slice.call(document.querySelectorAll('[reload=true]'));
      this._inputs = [].slice.call(document.querySelectorAll('input.form-abe'));
      this._inputs = this._inputs.concat([].slice.call(document.querySelectorAll('textarea.form-abe')));

      Array.prototype.forEach.call(this._reloads, function (reload) {
        reload.removeEventListener('blur', _this._handleReloadBlur);
        reload.addEventListener('blur', _this._handleReloadBlur);
      });

      Array.prototype.forEach.call(this._inputs, function (input) {
        input.removeEventListener('focus', _this._handleInputFocus);
        input.addEventListener('focus', _this._handleInputFocus);
      });

      this._selects = [].slice.call(document.querySelectorAll('#abeForm select'));
      Array.prototype.forEach.call(this._selects, function (select) {
        select.removeEventListener('change', _this._handleChangeSelect);
        select.addEventListener('change', _this._handleChangeSelect);
      });
    }

    /**
     * Manage input element to update template page
     * @return {void}
     */

  }, {
    key: '_inputElements',
    value: function _inputElements() {
      var _this2 = this;

      this._handleReloadBlur = this._inputReloadBlur.bind(this);
      this._handleInputFocus = this._inputFocus.bind(this);
      this._handleInputBlur = this._inputBlur.bind(this);
      this._handleInputKeyup = this._inputKeyup.bind(this);
      this._handleChangeSelect = this._changeSelect.bind(this);

      var richs = document.querySelectorAll('.rich');
      if (typeof richs !== 'undefined' && richs !== null) {
        Array.prototype.forEach.call(richs, function (rich) {
          new _richTexarea2.default(rich, _this2.color);
        });
      }

      this.rebind();
    }
  }, {
    key: '_hideIfEmpty',
    value: function _hideIfEmpty(node, value) {
      var hide = (0, _iframe.IframeNode)('#page-template', '[data-if-empty-clear="' + node.getAttribute('data-abe-') + '"]')[0];

      if (typeof hide !== 'undefined' && hide !== null) {
        if (value === '') {
          hide.style.display = 'none';
        } else {
          hide.style.display = '';
        }
      }
    }

    /**
     * [_inputBlur description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_inputBlur',
    value: function _inputBlur(e) {
      var _this3 = this;

      e.target.removeEventListener('keyup', this._handleInputFocus);
      e.target.removeEventListener('blur', this._handleInputFocus);

      var nodes = _EditorUtils2.default.getNode(_EditorUtils2.default.getAttr(e.target));
      Array.prototype.forEach.call(nodes, function (node) {
        _this3._hideIfEmpty(node, e.target.value);
        _EditorUtils2.default.formToHtml(node, e.target);
        node.classList.remove('select-border');
        node.classList.remove('display-attr');
      });

      this.onBlur._fire();
    }

    /**
     * [_inputKeyup description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_inputKeyup',
    value: function _inputKeyup(e) {
      var _this4 = this;

      var nodes = _EditorUtils2.default.getNode(_EditorUtils2.default.getAttr(e.target));
      Array.prototype.forEach.call(nodes, function (node) {
        _this4._hideIfEmpty(node, e.target.value);
        _EditorUtils2.default.formToHtml(node, e.target);
      });
    }

    /**
     * [_inputFocus description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_inputReloadBlur',
    value: function _inputReloadBlur(e) {
      if (e.currentTarget.getAttribute('data-autocomplete') !== 'true') {
        this.onReload._fire();
      }
    }

    /**
     * [_inputFocus description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_inputFocus',
    value: function _inputFocus(e) {
      _EditorUtils2.default.checkAttribute();
      _EditorUtils2.default.scrollToInputElement(e.target);

      // switch to set appropriate output {text|link|image|...}
      // listen to user input on ABE from
      e.target.addEventListener('keyup', this._handleInputKeyup);
      e.target.addEventListener('blur', this._handleInputBlur);
    }

    /**
     * [_changeSelect description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_changeSelect',
    value: function _changeSelect(e) {
      var _this5 = this;

      var target = e.currentTarget;
      var maxLength = parseInt(target.getAttribute('data-maxlength'));
      var options = [].slice.call(target.querySelectorAll('option'));
      var optionsChecked = target.querySelectorAll('option:checked');
      var count = optionsChecked.length;
      var attr = _EditorUtils2.default.getAttr(target);

      if (typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
        if (count > maxLength) {
          var lastValues = JSON.parse(target.getAttribute('last-values'));

          Array.prototype.forEach.call(optionsChecked, function (optionChecked) {
            var unselect = true;
            Array.prototype.forEach.call(lastValues, function (lastValue) {
              if (optionChecked.value.indexOf('{') > -1 || optionChecked.value.indexOf('[') > -1) {
                if (JSON.stringify(JSON.parse(optionChecked.value)) == JSON.stringify(lastValue)) {
                  unselect = false;
                }
              } else {
                if (optionChecked.value == lastValue) {
                  unselect = false;
                }
              }
            });

            if (unselect) {
              optionChecked.removeAttribute('selected');
              optionChecked.selected = false;
              optionChecked.disabled = true;
            }
          });
        } else {
          var lastValues = '[';
          Array.prototype.forEach.call(optionsChecked, function (optionChecked) {
            if (optionChecked.value !== '') {
              if (optionChecked.value.indexOf('{') > -1 || optionChecked.value.indexOf('[') > -1) {
                lastValues += JSON.stringify(JSON.parse(optionChecked.value));
              } else {
                lastValues += '"' + optionChecked.value + '"';
              }
            }
            lastValues += ',';
          });
          lastValues = lastValues.substring(0, lastValues.length - 1);
          lastValues += ']';
          target.setAttribute('last-values', lastValues);
        }
      }

      // var blockContent = IframeNode('#page-template', '.select-' + attr.id)[0]

      var nodeComments = (0, _iframe.IframeCommentNode)('#page-template', attr.id);

      if (typeof nodeComments !== 'undefined' && nodeComments !== null && nodeComments.length > 0) {
        var checked = e.target.querySelectorAll('option:checked');
        var json = this._json.data;

        json[attr.id] = [];
        Array.prototype.forEach.call(checked, function (check) {
          if (check.value !== '') {
            if (check.value.indexOf('{') > -1 || check.value.indexOf('[') > -1) {
              json[attr.id].push(JSON.parse(check.value));
            } else {
              json[attr.id].push(check.value);
            }
          }
        });

        this._json.data = json;

        Array.prototype.forEach.call(nodeComments, function (nodeComment) {
          var blockHtml = unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, '')).replace(/\[0\]-/g, '[0]-');

          // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
          var template = _handlebars2.default.compile(blockHtml, { noEscape: true });
          var compiled = template(_this5._json.data);

          nodeComment.parentNode.innerHTML = compiled + ('<!-- ' + nodeComment.textContent + ' -->');
        });
      } else if (typeof attr.id !== 'undefined' && attr.id !== null) {
        var nodes = _EditorUtils2.default.getNode(attr);
        Array.prototype.forEach.call(nodes, function (node) {
          _EditorUtils2.default.formToHtml(node, target);
        });
      }

      Array.prototype.forEach.call(options, function (option) {
        option.disabled = false;
      });
    }
  }]);

  return EditorInputs;
}();

exports.default = EditorInputs;