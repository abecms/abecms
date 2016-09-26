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

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Json = function () {
  function Json(enforcer) {
    _classCallCheck(this, Json);

    this._headers = {};
    this._data = json;
    this._ajax = _nanoajax2.default.ajax;
    this.canSave = true;

    this.saving = (0, _on2.default)(this);
    this.headersSaving = (0, _on2.default)(this);

    if (enforcer != singletonEnforcer) throw 'Cannot construct Json singleton';
  }

  _createClass(Json, [{
    key: 'save',
    value: function save() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'draft' : arguments[0];

      var _this = this;

      var tplPath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
      var filePath = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      this.saving._fire({ type: type });
      var p = new _es6Promise.Promise(function (resolve, reject) {
        if (!_this.canSave) {
          resolve({});
          _this.canSave = true;
          return;
        }
        var jsonSave = _this.data;
        var abe_source = [];

        if (typeof json.abe_source !== 'undefined' && json.abe_source !== null) {
          delete json.abe_source;
        }

        var toSave = _qs2.default.stringify({
          tplPath: tplPath ? tplPath : CONFIG.TPLPATH,
          filePath: filePath ? filePath : CONFIG.FILEPATH,
          json: jsonSave
        });

        _this.headersSaving._fire({ url: document.location.origin + '/' + type });

        _this._ajax({
          url: document.location.origin + '/' + type,
          body: toSave,
          headers: _this._headers,
          method: 'post'
        }, function (code, responseText, request) {
          try {
            var jsonRes = JSON.parse(responseText);
            if (typeof jsonRes.error !== 'undefined' && jsonRes.error !== null) {
              alert(jsonRes.error);
              return;
            }
            if (typeof jsonRes.reject !== 'undefined' && jsonRes.reject !== null) {
              location.reload();
              return;
            }
            _this.data = jsonRes.json;
          } catch (e) {
            alert('The following error happened : \n' + e + '\n if it persist, reload your web page tab.');
            jsonRes = {};
          }
          resolve(jsonRes);
        });
      });

      return p;
    }
  }, {
    key: 'data',
    set: function set(obj) {
      this._data = obj;
    },
    get: function get() {
      return this._data;
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new Json(singletonEnforcer);
        window.formJson = this[singleton];
      }
      return this[singleton];
    }
  }]);

  return Json;
}();

exports.default = Json;