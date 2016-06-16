'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iframe = require('../utils/iframe');

var _EditorUtils = require('./EditorUtils');

var _EditorUtils2 = _interopRequireDefault(_EditorUtils);

var _EditorJson = require('../modules/EditorJson');

var _EditorJson2 = _interopRequireDefault(_EditorJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorSave = function () {
  function EditorSave() {
    var _this = this;

    _classCallCheck(this, EditorSave);

    this._json = _EditorJson2.default.instance;
    this._saveType = 'draft';

    this._abeForm = document.querySelector('#abeForm');
    this._abeFormSubmit = document.querySelector('#abeForm button[type=submit]');

    this._handleSubmitClick = this._submitClick.bind(this);

    this._btnSaves = document.querySelectorAll('.btn-save');
    Array.prototype.forEach.call(this._btnSaves, function (btnSave) {
      btnSave.addEventListener('click', _this._handleSubmitClick);
    });

    var pageTpl = document.querySelector('#page-template');
    if (typeof pageTpl !== 'undefined' && pageTpl !== null) {
      document.querySelector('#page-template').addEventListener('load', function () {
        _EditorUtils2.default.checkAttribute();
      });
    }

    if (typeof this._abeForm !== 'undefined' && this._abeForm !== null) {
      this._formSubmit();
    }
  }

  /**
   * return abe form to json
   * @return {Object} json
   */


  _createClass(EditorSave, [{
    key: 'serializeForm',
    value: function serializeForm() {
      var _this2 = this;

      var inputs = [].slice.call(document.getElementById('abeForm').querySelectorAll('input'));
      var selects = [].slice.call(document.getElementById('abeForm').querySelectorAll('select'));
      inputs = inputs.concat(selects);
      var textareas = [].slice.call(document.getElementById('abeForm').querySelectorAll('textarea'));
      inputs = inputs.concat(textareas);

      this._json.data = json;

      Array.prototype.forEach.call(inputs, function (input) {
        var dataId = input.getAttribute('data-id');
        if (input.type === 'file') return;
        if (typeof dataId !== 'undefined' && dataId !== null) {
          if (dataId.indexOf('[') > -1) {
            var obj = dataId.split('[')[0];
            var index = dataId.match(/[^\[]+?(?=\])/)[0];
            var key = dataId.replace(/[^\.]+?-/, '');
            if (typeof _this2._json.data[obj] === 'undefined' || _this2._json.data[obj] === null) _this2._json.data[obj] = [];
            if (typeof _this2._json.data[obj][index] === 'undefined' || _this2._json.data[obj][index] === null) _this2._json.data[obj][index] = {};
            _this2._json.data[obj][index][key] = input.value;
          } else {
            var value;

            if (input.nodeName === 'SELECT') {
              var checked = input.querySelectorAll('option:checked');
              value = [];
              Array.prototype.forEach.call(checked, function (check) {
                if (check.value !== '') {
                  if (check.value.indexOf('{') > -1 || check.value.indexOf('[') > -1) {
                    value.push(JSON.parse(check.value));
                  } else {
                    value.push(check.value);
                  }
                }
              });
            } else if (input.getAttribute('data-autocomplete') === 'true') {
              var results = input.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result');
              value = [];
              Array.prototype.forEach.call(results, function (result) {
                var val = result.getAttribute('value');
                if (val !== '') {
                  if (val.indexOf('{') > -1 || val.indexOf('[') > -1) {
                    value.push(JSON.parse(val));
                  } else {
                    value.push(val);
                  }
                }
              });
            } else {
              value = input.value.replace(/\"/g, '\&quot;') + "";
            }
            _this2._json.data[dataId] = value;
          }
        }
      });
    }
  }, {
    key: 'savePage',
    value: function savePage(type) {
      var tplName = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
      var filePath = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var target = document.querySelector('[data-action="' + type + '"]');
      this.serializeForm();
      target.classList.add('loading');
      target.setAttribute('disabled', 'disabled');

      this._json.save(this._saveType).then(function (result) {
        target.classList.add('done');
        // this._populateFromJson(this._json.data)
        if (result.success === 1) {
          CONFIG.TPLNAME = result.json.abe_meta.latest.abeUrl;
          if (CONFIG.TPLNAME[0] === '/') CONFIG.TPLNAME = CONFIG.TPLNAME.slice(1);
        }

        var tplNameParam = '?tplName=';
        var filePathParam = '&filePath=';

        var getParams = window.location.search.slice(1).split('&');
        getParams.forEach(function (getParam) {
          var param = getParam.split('=');
          if (param[0] === 'tplName') {
            tplNameParam += param[1];
          }
          if (param[0] === 'filePath') {
            if (param[1].indexOf('-abe-') > -1) {
              filePathParam += CONFIG.TPLNAME;
            } else {
              filePathParam += param[1];
            }
          }
        });
        var ext = filePathParam.split('.');
        ext = ext[ext.length - 1];
        filePathParam = filePathParam.replace(new RegExp('-abe-(.+?)(?=\.' + ext + ')'), '');
        var reloadUrl = top.location.protocol + '//' + window.location.host + window.location.pathname + tplNameParam + filePathParam;

        target.classList.remove('loading');
        target.classList.remove('done');
        target.removeAttribute('disabled');
        if (result.success === 1) window.location.href = reloadUrl;
      }).catch(function (e) {
        console.error(e.stack);
      });
    }

    /**
     * Listen form submit and save page template 
     * @return {void}
     */

  }, {
    key: '_formSubmit',
    value: function _formSubmit(target) {
      var _this3 = this;

      this._abeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        _this3.savePage(_this3._saveType);
      });
    }
  }, {
    key: '_submitClick',
    value: function _submitClick(e) {
      this._saveType = e.currentTarget.getAttribute('data-action');
      this._abeFormSubmit.click();
    }

    /**
     * populate all form and iframe html with json
     * @param  {Object} json object with all values
     * @return {null}
     */

  }, {
    key: '_populateFromJson',
    value: function _populateFromJson(json) {
      this._json.data = json;
      var forms = document.querySelectorAll('.form-abe');
      Array.prototype.forEach.call(forms, function (form) {
        var id = form.getAttribute('data-id');
        if (typeof id != 'undefined' && id !== null && typeof json[id] != 'undefined' && json[id] !== null) {
          var value = json[id];
          if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
            value = JSON.stringify(value);
          } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
            value = JSON.stringify(value);
          }
          form.value = value;

          var dataIdLink = form.getAttribute('data-id-link');
          var node = (0, _iframe.IframeNode)('#page-template', '[data-abe-' + id.replace(/\[([0-9]*)\]/g, '$1') + ']')[0];
          _EditorUtils2.default.formToHtml(node, form);
        }
      });
    }
  }]);

  return EditorSave;
}();

exports.default = EditorSave;