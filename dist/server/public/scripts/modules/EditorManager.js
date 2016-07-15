'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _es6Promise = require('es6-promise');

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _strUtils = require('../utils/str-utils');

var _strUtils2 = _interopRequireDefault(_strUtils);

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorManager = function () {
  function EditorManager() {
    _classCallCheck(this, EditorManager);

    this._ajax = _nanoajax2.default.ajax;

    this.remove = (0, _on2.default)(this);

    // wrapper files
    this._manager = document.querySelector('.manager-wrapper');
    this._managerTabs = document.querySelectorAll('[data-manager-show]');
    this._filesList = [].slice.call(document.querySelectorAll('.manager-files .list-group-item'));

    // manager config button
    this._btnSaveConfig = document.querySelectorAll('[data-save-config]');

    // button manager
    this._btnRepublish = document.querySelector('[data-republish]');
    this._btnCloseManager = document.querySelector('.close-manager');
    this._btnManager = document.querySelector('.btn-manager');
    this._btnVisitSite = document.querySelectorAll('.btn-visit-site');
    this._btnDataFile = document.querySelector('[data-file="true"]');

    this._btnDeleteFile = [].slice.call(document.querySelectorAll('[data-delete="true"]'));
    this._btnUnpublishFile = [].slice.call(document.querySelectorAll('[data-unpublish="true"]'));

    // event handlers
    this._handleBtnRepublishClick = this._btnRepublishClick.bind(this);
    this._handleBtnCloseManagerClick = this._btnCloseManagerClick.bind(this);
    this._handleBtnManagerTabClick = this._btnManagerTabClick.bind(this);
    this._handleBtnManagerClick = this._btnManagerClick.bind(this);
    this._handleBtnSaveConfigClick = this._btnSaveConfigClick.bind(this);
    this._handleBtnVisitClick = this._btnVisitClick.bind(this);

    this._handleBtnDeleteClick = this._btnDeleteClick.bind(this);
    this._handleBtnUnpublishClick = this._btnUnpublishClick.bind(this);

    if (typeof top.location.hash !== 'undefined' && top.location.hash !== null && top.location.hash !== '') {
      var currentTab = document.querySelector('[href="' + top.location.hash + '"]');
      if (typeof currentTab !== 'undefined' && currentTab !== null) {
        currentTab.click(); // retrieve old selected tab
      }
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      return location.hash = $(e.target).attr('href').substr(1);
    });

    this._bindEvents();
  }

  _createClass(EditorManager, [{
    key: '_btnDeleteClick',
    value: function _btnDeleteClick(e) {
      var _this = this;

      e.preventDefault();
      var confirmDelete = confirm(e.currentTarget.getAttribute('data-text'));
      if (!confirmDelete) return;
      var href = e.currentTarget.getAttribute('href');
      var target = e.currentTarget;
      this._ajax({
        url: href,
        method: 'get'
      }, function (code, responseText, request) {
        _this.remove._fire(target.parentNode.parentNode.parentNode.parentNode);
      });
    }
  }, {
    key: '_btnUnpublishClick',
    value: function _btnUnpublishClick(e) {
      e.preventDefault();
      var confirmDelete = confirm(e.currentTarget.getAttribute('data-text'));
      if (!confirmDelete) return;
      var href = e.currentTarget.getAttribute('href');
      var target = e.currentTarget;
      this._ajax({
        url: href,
        method: 'get'
      }, function (code, responseText, request) {
        var labels = target.parentNode.parentNode.parentNode.querySelectorAll('.label:not(.hidden)');
        var p = target.parentNode.parentNode.parentNode.querySelector('.label-published');

        Array.prototype.forEach.call(labels, function (label) {
          label.classList.add('hidden');
        });
        var draft = target.parentNode.parentNode.parentNode.querySelector('.label-draft');

        if (typeof draft !== 'undefined' && draft !== null) {
          draft.classList.remove('hidden');
        }

        if (typeof p !== 'undefined' && p !== null) p.remove();
        target.remove();
      });
    }
  }, {
    key: '_btnVisitClick',
    value: function _btnVisitClick(e) {
      var target = e.target;
      var dataPage = target.getAttribute('data-page');
      this._ajax({
        url: document.location.origin + target.getAttribute('data-href'),
        method: 'get'
      }, function (code, responseText, request) {
        var res = JSON.parse(responseText);
        var routePath = typeof dataPage !== 'undefined' && dataPage !== null ? dataPage : '';
        res.port = res.port === 80 ? '' : ':' + res.port;
        window.open('' + res.webroot.replace(/\/$/, "") + res.port + '/' + routePath, '_blank');
      });
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents(e) {
      var _this2 = this;

      Array.prototype.forEach.call(this._managerTabs, function (managerTab) {
        managerTab.addEventListener('click', _this2._handleBtnManagerTabClick);
      });
      Array.prototype.forEach.call(this._btnSaveConfig, function (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', _this2._handleBtnSaveConfigClick);
      });
      Array.prototype.forEach.call(this._btnVisitSite, function (btnVisitSite) {
        btnVisitSite.addEventListener('click', _this2._handleBtnVisitClick);
      });
      this._btnManager.addEventListener('click', this._handleBtnManagerClick);

      if (typeof this._btnRepublish !== 'undefined' && this._btnRepublish !== null) {
        this._btnRepublish.addEventListener('click', this._handleBtnRepublishClick);
      }

      if (typeof this._btnCloseManager !== 'undefined' && this._btnCloseManager !== null) {
        this._btnCloseManager.addEventListener('click', this._handleBtnCloseManagerClick);
      }

      Array.prototype.forEach.call(this._btnDeleteFile, function (deleteFile) {
        deleteFile.addEventListener('click', _this2._handleBtnDeleteClick);
      });

      Array.prototype.forEach.call(this._btnUnpublishFile, function (unpublishFile) {
        unpublishFile.addEventListener('click', _this2._handleBtnUnpublishClick);
      });
    }
  }, {
    key: '_btnRepublishClick',
    value: function _btnRepublishClick(e) {
      e.preventDefault();
      this._btnRepublish.querySelector('[data-not-clicked]').className = 'hidden';
      this._btnRepublish.querySelector('[data-clicked]').className = '';
      this._ajax({
        url: document.location.origin + '/abe/republish',
        method: 'get'
      }, function (code, responseText, request) {});
    }
  }, {
    key: '_btnCloseManagerClick',
    value: function _btnCloseManagerClick() {
      this._manager.classList.remove('visible');
    }
  }, {
    key: '_save',
    value: function _save(website, json, path) {
      var _this3 = this;

      var p = new _es6Promise.Promise(function (resolve, reject) {
        var toSave = _qs2.default.stringify({
          website: website,
          json: json
        });

        _this3._ajax({
          url: document.location.origin + path + '?' + toSave,
          method: 'get'
        }, function (code, responseText, request) {
          // this.data = JSON.parse(responseText).json

          resolve();
        });
      });

      return p;
    }
  }, {
    key: '_dotStringToJson',
    value: function _dotStringToJson(str, value) {
      var keys = str.split('.');
      var value = value;
      var objStrStart = '';
      var objStrEnd = '';
      Array.prototype.forEach.call(keys, function (key) {
        objStrStart += '{"' + key + '":';
        objStrEnd += '}';
      });
      return JSON.parse(objStrStart + '"' + value + '"' + objStrEnd);
    }
  }, {
    key: '_serializeForm',
    value: function _serializeForm(form) {
      var _this4 = this;

      var json = {};
      var inputs = [].slice.call(form.querySelectorAll('input[type=text]'));
      Array.prototype.forEach.call(inputs, function (input) {
        (0, _extend2.default)(true, json, _this4._dotStringToJson(input.getAttribute('data-json-key'), input.value));
      });

      return json;
    }
  }, {
    key: '_btnSaveConfigClick',
    value: function _btnSaveConfigClick(e) {
      e.preventDefault();
      var website = e.currentTarget.getAttribute('data-website');
      var route = e.currentTarget.getAttribute('data-route');
      var json = this._serializeForm(document.querySelector('form#config-' + website));
      this._save(website, json, route);
    }
  }, {
    key: '_hideManagerBlock',
    value: function _hideManagerBlock() {
      Array.prototype.forEach.call(this._managerTabs, function (managerTab) {
        var classname = '.' + managerTab.getAttribute('data-manager-show');
        var blockElement = document.querySelector(classname);
        if (typeof blockElement !== 'undefined' && blockElement !== null) blockElement.classList.remove('visible');
      });
    }
  }, {
    key: '_btnManagerTabClick',
    value: function _btnManagerTabClick(e) {
      e.preventDefault();
      var classname = e.currentTarget.getAttribute('data-manager-show');
      this._hideManagerBlock();
      var blockElement = document.querySelector('.' + classname);
      if (typeof blockElement !== 'undefined' && blockElement !== null) blockElement.classList.add('visible');
    }
  }, {
    key: '_btnManagerClick',
    value: function _btnManagerClick(e) {
      if (this._manager.classList.contains('visible')) {
        this._manager.classList.remove('visible');
      } else {
        this._manager.classList.add('visible');
      }
    }
  }]);

  return EditorManager;
}();

exports.default = EditorManager;