'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _es6Promise = require('es6-promise');

var _slugify = require('./helpers/slugify');

var _slugify2 = _interopRequireDefault(_slugify);

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Create = function () {
  function Create() {
    _classCallCheck(this, Create);
  }

  _createClass(Create, [{
    key: 'init',
    value: function init(path) {
      var _this = this;

      path = path.split('/');
      path[path.length - 1] = (0, _slugify2.default)(path[path.length - 1]);
      path = path.join('/');
      this.addFolder(path).then(function () {
        process.chdir(path);
        _this.addFolder(_.config.publish.url);
        _this.addFolder(_.config.templates.url);
        _this.addFolder(_.config.structure.url);
        _this.addFolder(_.config.reference.url);
        _this.addFolder(_.config.data.url);
        _this.addFolder(_.config.draft.url);
      }).catch(function (e) {
        console.error(e);
      });
    }
  }, {
    key: 'addFolder',
    value: function addFolder(folder) {
      var p = new _es6Promise.Promise(function (resolve, reject) {
        (0, _mkdirp2.default)(folder);
        resolve();
      });

      return p;
    }
  }]);

  return Create;
}();

exports.default = Create;