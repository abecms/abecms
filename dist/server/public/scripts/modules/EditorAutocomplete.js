'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorAutocomplete = function () {
  function EditorAutocomplete() {
    _classCallCheck(this, EditorAutocomplete);

    this._ajax = _nanoajax2.default.ajax;
    this._json = _EditorJson2.default.instance;
    this.onReload = (0, _on2.default)(this);
    this._previousValue = '';

    this._handleKeyUp = this._keyUp.bind(this);
    this._handleKeyDown = this._keyDown.bind(this);
    this._handleFocus = this._focus.bind(this);
    this._handleBlur = this._blur.bind(this);
    this._handleRemove = this._remove.bind(this);
    this._handleDocumentClick = this._documentClick.bind(this);
    this._handleSelectValue = this._selectValue.bind(this);

    this._autocompletesRemove = [].slice.call(document.querySelectorAll('[data-autocomplete-remove=true]'));
    this._autocompletes = [].slice.call(document.querySelectorAll('[data-autocomplete=true]'));

    this._currentInput = null;
    this._divWrapper = document.createElement('div');
    this._divWrapper.classList.add('autocomplete-wrapper');

    this._visible = false;

    this.rebind();
  }

  _createClass(EditorAutocomplete, [{
    key: 'rebind',
    value: function rebind() {
      var _this = this;

      document.body.removeEventListener('mouseup', this._handleDocumentClick);
      document.body.addEventListener('mouseup', this._handleDocumentClick);

      Array.prototype.forEach.call(this._autocompletesRemove, function (autocompleteRemove) {
        autocompleteRemove.addEventListener('click', _this._handleRemove);
      });

      Array.prototype.forEach.call(this._autocompletes, function (autocomplete) {
        document.body.removeEventListener('keydown', _this._handleKeyDown);
        document.body.addEventListener('keydown', _this._handleKeyDown);
        autocomplete.removeEventListener('keyup', _this._handleKeyUp);
        autocomplete.addEventListener('keyup', _this._handleKeyUp);
        autocomplete.removeEventListener('focus', _this._handleFocus);
        autocomplete.addEventListener('focus', _this._handleFocus);
        autocomplete.removeEventListener('blur', _this._handleBlur);
        autocomplete.addEventListener('blur', _this._handleBlur);
      });
    }
  }, {
    key: '_saveData',
    value: function _saveData() {
      var _this2 = this;

      var id = this._currentInput.getAttribute('id');
      var nodeComments = (0, _iframe.IframeCommentNode)('#page-template', id);
      var maxLength = this._currentInput.getAttribute('data-maxlength');

      if (typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
        maxLength = parseInt(maxLength);
        var countLength = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length;
        if (countLength === maxLength) {
          this._currentInput.value = '';
          this._divWrapper.parentNode.removeChild(this._divWrapper);
          this._currentInput.setAttribute('disabled', 'disabled');
        } else {
          this._currentInput.removeAttribute('disabled');
        }
      }

      if (typeof nodeComments !== 'undefined' && nodeComments !== null && nodeComments.length > 0) {
        var results = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result'));
        var json = this._json.data;

        json[id] = [];
        Array.prototype.forEach.call(results, function (result) {
          var value = result.getAttribute('value');
          if (value !== '') {
            if (value.indexOf('{') > -1 || value.indexOf('[') > -1) {
              json[id].push(JSON.parse(value));
            } else {
              json[id].push(value);
            }
          }
        });

        this._json.data = json;

        Array.prototype.forEach.call(nodeComments, function (nodeComment) {
          var blockHtml = unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, '')).replace(/\[0\]-/g, '[0]-');

          // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
          var template = _handlebars2.default.compile(blockHtml, { noEscape: true });
          var compiled = template(_this2._json.data);

          nodeComment.parentNode.innerHTML = compiled + ('<!-- ' + nodeComment.textContent + ' -->');
        });
      } else if (typeof id !== 'undefined' && id !== null) {
        if (this._currentInput.getAttribute('visible') === true) {
          var nodes = _EditorUtils2.default.getNode(attr);
          Array.prototype.forEach.call(nodes, function (node) {
            _EditorUtils2.default.formToHtml(node, _this2._currentInput);
          });
        }
      }

      this.onReload._fire();
    }
  }, {
    key: '_documentClick',
    value: function _documentClick(e) {
      if (this._visible && !this._canSelect) {
        if (typeof this._divWrapper.parentNode !== 'undefined' && this._divWrapper.parentNode !== null) {
          this._hide();
        }
      }
    }
  }, {
    key: '_select',
    value: function _select(target) {
      var val = JSON.parse(target.getAttribute('data-value'));
      var maxLength = this._currentInput.getAttribute('data-maxlength');
      if (typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
        maxLength = parseInt(maxLength);
        var countLength = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length;
        if (countLength + 1 > maxLength) {
          return;
        }
      }
      var display = target.getAttribute('data-display');
      var div = document.createElement('div');
      div.classList.add('autocomplete-result');
      div.setAttribute('data-parent-id', this._currentInput.getAttribute('data-id'));
      div.setAttribute('value', target.getAttribute('data-value'));
      div.innerHTML = '' + this._deep_value_array(val, display);

      var resWrapper = this._divWrapper.parentNode.querySelector('.autocomplete-result-wrapper');

      var remove = document.createElement('span');
      remove.classList.add('glyphicon', 'glyphicon-remove');
      remove.setAttribute('data-autocomplete-remove', 'true');
      remove.addEventListener('click', this._handleRemove);
      div.appendChild(remove);

      resWrapper.appendChild(div);

      this._saveData();
    }
  }, {
    key: '_selectValue',
    value: function _selectValue(e) {
      this._select(e.currentTarget);
    }
  }, {
    key: '_showAutocomplete',
    value: function _showAutocomplete(sources, target, val) {
      var _this3 = this;

      var display = target.getAttribute('data-display');
      var first = true;

      this._divWrapper.innerHTML = '';
      if (typeof sources !== 'undefined' && sources !== null) {
        if ((typeof sources === 'undefined' ? 'undefined' : _typeof(sources)) === 'object' && Object.prototype.toString.call(sources) === '[object Object]') {
          sources = [sources];
        }
        Array.prototype.forEach.call(sources, function (source) {
          var sourceVal = _this3._deep_value_array(source, display).toLowerCase();
          if (sourceVal.indexOf(val) > -1) {
            var div = document.createElement('div');
            div.addEventListener('mousedown', _this3._handleSelectValue);
            div.setAttribute('data-value', JSON.stringify(source));
            div.setAttribute('data-display', display);
            if (first) {
              div.classList.add('selected');
            }
            first = false;
            div.innerHTML = sourceVal.replace(val, '<span class="select">' + val + '</span>');
            _this3._divWrapper.appendChild(div);
          }
        });
      }
      this._show(target);
    }
  }, {
    key: '_hide',
    value: function _hide() {
      if (this._visible) {
        this._visible = false;
        this._shouldBeVisible = false;
        this._divWrapper.parentNode.removeChild(this._divWrapper);
      }
    }
  }, {
    key: '_show',
    value: function _show(target) {
      if (!this._visible) {
        this._visible = true;
        this._divWrapper.style.marginTop = target.offsetHeight + 'px';
        this._divWrapper.style.width = target.offsetWidth + 'px';
        target.parentNode.insertBefore(this._divWrapper, target);
      }
    }
  }, {
    key: '_startAutocomplete',
    value: function _startAutocomplete(target) {
      var _this4 = this;

      var val = target.value.toLowerCase();
      if (val.length > 2) {
        if (this._previousValue === val) {
          this._show(target);
          return;
        } else {
          this._previousValue = val;
        }
        var dataVal = target.getAttribute('data-value');

        if (dataVal.indexOf('http') === 0) {
          this._ajax({
            url: '' + dataVal + val,
            body: '',
            cors: true,
            method: 'get'
          }, function (code, responseText, request) {
            _this4._showAutocomplete(JSON.parse(responseText), target, val);
          });
        } else {
          var sources = JSON.parse(target.getAttribute('data-value'));
          this._showAutocomplete(sources, target, val);
        }
      } else {
        this._hide();
      }
    }
  }, {
    key: '_keyUp',
    value: function _keyUp(e) {
      if (e.keyCode !== 13) {
        this._startAutocomplete(e.currentTarget);
      }
    }
  }, {
    key: '_keyDown',
    value: function _keyDown(e) {
      if (this._canSelect) {
        var parent = this._currentInput.parentNode.querySelector('.autocomplete-wrapper');
        if (typeof parent !== 'undefined' && parent !== null) {
          var current = this._currentInput.parentNode.querySelector('.autocomplete-wrapper .selected');

          var newSelected = null;
          var selected = document.querySelector('.autocomplete-wrapper .selected');
          switch (e.keyCode) {
            case 9:
              // tab
              this._hide();
              break;
            case 13:
              // enter
              e.preventDefault();
              if (typeof selected !== 'undefined' && selected !== null) {
                this._select(selected);
                this._hide();
              }
              break;
            case 27:
              // escape
              e.preventDefault();
              this._hide();
              break;
            case 40:
              // down
              e.preventDefault();
              if (typeof selected !== 'undefined' && selected !== null) {
                newSelected = selected.nextSibling;
                this._show(e.currentTarget);
              }
              break;
            case 38:
              // prev
              e.preventDefault();
              if (typeof selected !== 'undefined' && selected !== null) {
                newSelected = selected.previousSibling;
              }
              break;
            default:
              break;
          }

          if (typeof newSelected !== 'undefined' && newSelected !== null) {
            var scrollTopMin = parent.scrollTop;
            var scrollTopMax = parent.scrollTop + parent.offsetHeight - newSelected.offsetHeight;
            var offsetTop = newSelected.offsetTop;
            if (scrollTopMax < offsetTop) {
              parent.scrollTop = newSelected.offsetTop - parent.offsetHeight + newSelected.offsetHeight;
            } else if (scrollTopMin > offsetTop) {
              parent.scrollTop = newSelected.offsetTop;
            }
            current.classList.remove('selected');
            newSelected.classList.add('selected');
          }
        }
      }
    }
  }, {
    key: '_focus',
    value: function _focus(e) {
      this._canSelect = true;
      this._currentInput = e.currentTarget;
      this._startAutocomplete(e.currentTarget);
    }
  }, {
    key: '_blur',
    value: function _blur(e) {
      this._canSelect = false;
      this._currentInput = null;
      this._hide();
    }
  }, {
    key: '_remove',
    value: function _remove(e) {
      var target = e.currentTarget.parentNode;
      this._currentInput = document.querySelector('#' + target.getAttribute('data-parent-id'));
      target.parentNode.removeChild(target);
      this._saveData();
      this._currentInput = null;
    }
  }, {
    key: '_deep_value_array',
    value: function _deep_value_array(obj, path) {
      var _this5 = this;

      if (path.indexOf('.') === -1) {
        return typeof obj[path] !== 'undefined' && obj[path] !== null ? obj[path] : null;
      }

      var pathSplit = path.split('.');
      var res = JSON.parse(JSON.stringify(obj));

      while (pathSplit.length > 0) {

        if (typeof res[pathSplit[0]] !== 'undefined' && res[pathSplit[0]] !== null) {
          if (_typeof(res[pathSplit[0]]) === 'object' && Object.prototype.toString.call(res[pathSplit[0]]) === '[object Array]') {
            var resArray = [];

            Array.prototype.forEach.call(res[pathSplit[0]], function (item) {
              resArray.push(_this5._deep_value_array(item, pathSplit.join('.').replace(pathSplit[0] + '.', '')));
            });
            res = resArray;
            pathSplit.shift();
          } else {
            res = res[pathSplit[0]];
          }
        } else {
          return null;
        }
        pathSplit.shift();
      }

      return res;
    }
  }, {
    key: '_deep_value',
    value: function _deep_value(obj, path) {

      if (path.indexOf('.') === -1) {
        return typeof obj[path] !== 'undefined' && obj[path] !== null ? obj[path] : null;
      }

      var pathSplit = path.split('.');
      var res = JSON.parse(JSON.stringify(obj));
      for (var i = 0; i < pathSplit.length; i++) {
        if (typeof res[pathSplit[i]] !== 'undefined' && res[pathSplit[i]] !== null) {
          res = res[pathSplit[i]];
        } else {
          return null;
        }
      }

      return res;
    }
  }]);

  return EditorAutocomplete;
}();

exports.default = EditorAutocomplete;