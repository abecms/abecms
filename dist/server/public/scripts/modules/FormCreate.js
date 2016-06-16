'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _FolderSelect = require('./FolderSelect');

var _FolderSelect2 = _interopRequireDefault(_FolderSelect);

var _TemplateSelect = require('./TemplateSelect');

var _TemplateSelect2 = _interopRequireDefault(_TemplateSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormCreate = function () {
  function FormCreate() {
    _classCallCheck(this, FormCreate);

    // constantes variables
    this._filePath = '';
    this._ajax = _nanoajax2.default.ajax;

    // constantes variables DOM elements
    this._form = document.querySelector('.form-create');
    this._templateName = this._form.querySelector('[data-type-template-abe]');
    this._tplName = this._form.querySelector('[name=tplName]');
    this._submitBtn = this._form.querySelector('button[type=submit]');
    this._inputs = [].slice.call(this._form.querySelectorAll('input[type=text]'));
    this._selects = [].slice.call(this._form.querySelectorAll('select[id*="level-"]'));

    // constantes methodes
    this._handlePathChange = this._pathChange.bind(this);
    this._handleCanCreate = this._canCreate.bind(this);
    this._handleSubmit = this._submit.bind(this);

    // manager update btn
    this._btnCreate = document.querySelector('[date-abe-create]');
    this._btnUpdate = document.querySelector('[date-abe-update]');
    this._btnDuplicate = document.querySelector('[date-abe-duplicate]');
    this._handleBtnDuplicateManagerClick = this._btnDuplicateManagerClick.bind(this);
    this._handleBtnUpdateManagerClick = this._btnUpdateManagerClick.bind(this);
    this._handleBtnCreateManagerClick = this._btnCreateManagerClick.bind(this);

    // init modules
    new _FolderSelect2.default();
    new _TemplateSelect2.default();

    this._bindEvents();
  }

  _createClass(FormCreate, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this = this;

      this._inputs.forEach(function (input) {
        input.addEventListener('keyup', _this._handleCanCreate);
      });
      this._inputs.forEach(function (input) {
        input.addEventListener('blur', _this._handleCanCreate);
      });
      this._selects.forEach(function (select) {
        select.addEventListener('change', _this._handlePathChange);
      });

      if (typeof this._btnUpdate !== 'undefined' && this._btnUpdate !== null) {
        this._btnUpdate.addEventListener('click', this._handleBtnUpdateManagerClick); // click update metadata
      }
      if (typeof this._btnCreate !== 'undefined' && this._btnCreate !== null) {
        this._btnCreate.addEventListener('click', this._handleBtnCreateManagerClick); // click update metadata
      }
      if (typeof this._btnDuplicate !== 'undefined' && this._btnDuplicate !== null) {
        this._btnDuplicate.addEventListener('click', this._handleBtnDuplicateManagerClick); // click duplicate content
      }

      if (typeof this._templateName !== 'undefined' && this._templateName !== null) {
        this._templateName.addEventListener('submit', this._handleCanCreate);
      }
      if (typeof this._form !== 'undefined' && this._form !== null) {
        this._form.addEventListener('submit', this._handleSubmit);
      }
    }
  }, {
    key: '_pathChange',
    value: function _pathChange(e) {
      this._setFilePath();
      this._canCreate();
    }
  }, {
    key: '_submit',
    value: function _submit(e) {
      this._setFilePath();
    }

    /**
     * check if select page create are not empty
     * @return {Boolean} true|false
     */

  }, {
    key: '_canCreate',
    value: function _canCreate() {
      var isValid = true;

      if (typeof this._templateName !== 'undefined' && this._templateName !== null && this._templateName.value === '') {
        isValid = false;
      }

      if (typeof this._tplName !== 'undefined' && this._tplName !== null && this._tplName.value === '') {
        isValid = false;
      }

      if (isValid) {
        this._submitBtn.removeAttribute('disabled');
      } else {
        this._submitBtn.setAttribute('disabled', 'disabled');
      }
    }
  }, {
    key: '_setFilePath',
    value: function _setFilePath() {
      this._filePath = this._getFilePath();
      this._form.querySelector('[name="filePath"]').value = this._filePath;
    }
  }, {
    key: '_getFilePath',
    value: function _getFilePath() {
      var path = '';

      this._selects.forEach(function (select) {
        if (select.offsetWidth > 0 && select.offsetHeight > 0) {
          var value = select.querySelector('option:checked').getAttribute('clean-value');
          if (typeof value !== 'undefined' && value !== null && value !== '') {
            path += value + '/';
          } else if (typeof select.value !== 'undefined' && select.value !== null && select.value !== '') {
            path += select.value + '/';
          }
        }
      });

      path = path.slice(0, -1);
      path = path.split('/');
      path = path.join('/');

      return path;
    }
  }, {
    key: '_btnDuplicateManagerClick',
    value: function _btnDuplicateManagerClick(e) {
      e.preventDefault();
      console.log('_btnDuplicateManagerClick');
    }
  }, {
    key: '_btnUpdateManagerClick',
    value: function _btnUpdateManagerClick(e) {
      e.preventDefault();
      console.log('_handleBtnUpdateManagerClick');
    }
  }, {
    key: '_btnCreateManagerClick',
    value: function _btnCreateManagerClick(e) {
      e.preventDefault();
      var inputs = [].slice.call(document.querySelectorAll('.form-create input'));
      inputs = inputs.concat([].slice.call(document.querySelectorAll('.form-create select')));
      var values = {};
      Array.prototype.forEach.call(inputs, function (input) {
        values[input.getAttribute('name')] = input.value;
      });
      var toSave = _qs2.default.stringify(values);
      this._ajax({
        url: document.location.origin + '/abe/create/?' + toSave,
        body: toSave,
        headers: {},
        method: 'get'
      }, function (code, responseText, request) {
        var jsonRes = JSON.parse(responseText);
        if (jsonRes.success == 1 && typeof jsonRes.json.abe_meta !== 'undefined' && jsonRes.json.abe_meta !== null) {
          window.location.href = window.location.origin + '/abe/' + jsonRes.json.abe_meta.template + '?filePath=' + jsonRes.json.abe_meta.link;
        } else {
          alert('error');
        }
      });
    }
  }]);

  return FormCreate;
}();

exports.default = FormCreate;