'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Devtool = require('./devtool/Devtool');

var _EditorInputs = require('./modules/EditorInputs');

var _EditorInputs2 = _interopRequireDefault(_EditorInputs);

var _EditorBlock = require('./modules/EditorBlock');

var _EditorBlock2 = _interopRequireDefault(_EditorBlock);

var _EditorUtils = require('./modules/EditorUtils');

var _EditorUtils2 = _interopRequireDefault(_EditorUtils);

var _EditorFiles = require('./modules/EditorFiles');

var _EditorFiles2 = _interopRequireDefault(_EditorFiles);

var _EditorSave = require('./modules/EditorSave');

var _EditorSave2 = _interopRequireDefault(_EditorSave);

var _EditorJson = require('./modules/EditorJson');

var _EditorJson2 = _interopRequireDefault(_EditorJson);

var _EditorManager = require('./modules/EditorManager');

var _EditorManager2 = _interopRequireDefault(_EditorManager);

var _EditorAutocomplete = require('./modules/EditorAutocomplete');

var _EditorAutocomplete2 = _interopRequireDefault(_EditorAutocomplete);

var _EditorReload = require('./modules/EditorReload');

var _EditorReload2 = _interopRequireDefault(_EditorReload);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var htmlTag = document.querySelector('html');
window.CONFIG = JSON.parse(htmlTag.getAttribute('data-config'));
window.json = JSON.parse(unescape(htmlTag.getAttribute('data-json').replace(/&quot;/g, '\"')));
window.Locales = JSON.parse(htmlTag.getAttribute('data-locales'));

var Engine = function () {
  function Engine() {
    var _this = this;

    _classCallCheck(this, Engine);

    this._blocks = new _EditorBlock2.default();
    this._inputs = new _EditorInputs2.default();
    this._files = new _EditorFiles2.default();
    this._save = new _EditorSave2.default();
    this._manager = new _EditorManager2.default();
    this._autocomplete = new _EditorAutocomplete2.default();
    this._dev = new _Devtool.Devtool();

    this.json = _EditorJson2.default.instance;

    this._bindEvents();

    this.table = null;
    $(document).ready(function () {
      _this.table = $('#navigation-list').DataTable({
        "pageLength": 50,
        "autoWidth": false
      });
    });
  }

  _createClass(Engine, [{
    key: 'loadIframe',
    value: function loadIframe() {
      _EditorReload2.default.instance.reload();
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this._blocks.onNewBlock(function () {
        _this2._files.rebind();
        _this2._inputs.rebind();
      });

      this._manager.remove(function (el) {
        _this2.table.row($(el)).remove().draw();
      });

      this._inputs.onReload(function () {
        _this2._save.serializeForm();
        _EditorReload2.default.instance.reload();
      });

      this._autocomplete.onReload(function () {
        _EditorReload2.default.instance.reload();
      });

      this._inputs.onBlur(function () {
        _this2._save.serializeForm();
      });

      this._blocks.onRemoveBlock(function () {
        _this2._inputs.rebind();
        _this2._save.serializeForm(); ///**************************************** HOOLA
      });
    }
  }]);

  return Engine;
}();

var engine = new Engine();
window.abe = {
  json: engine.json,
  inputs: engine._inputs,
  files: engine._files,
  blocks: engine._blocks,
  autocomplete: engine._autocomplete,
  editorReload: _EditorReload2.default
};

document.addEventListener("DOMContentLoaded", function (event) {
  if (document.querySelector('#page-template')) engine.loadIframe();
});