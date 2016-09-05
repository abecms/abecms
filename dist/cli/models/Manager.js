'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Manager = function () {
  function Manager(enforcer) {
    _classCallCheck(this, Manager);

    if (enforcer != singletonEnforcer) throw "Cannot construct Json singleton";

    _handlebars2.default.templates = _handlebars2.default.templates || {};
    this.loadHbsTemplates();

    this.updateList();
  }

  _createClass(Manager, [{
    key: 'getList',
    value: function getList() {

      return this._list;
    }
  }, {
    key: 'updateList',
    value: function updateList() {

      this._list = _cli.FileParser.getAllFiles();
      this._list.sort(_cli.FileParser.predicatBy('date'));

      return this;
    }
  }, {
    key: 'loadHbsTemplates',
    value: function loadHbsTemplates() {
      var path = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.templates.url, 'hbs');

      if (!_cli.folderUtils.isFolder(path)) {
        _mkdirp2.default.sync(path);
      }

      _fsExtra2.default.readdirSync(path).forEach(function (file) {
        if (file.indexOf(".hbs") > -1) {
          var tmpl = eval("(function(){return " + _fsExtra2.default.readFileSync(_cli.fileUtils.concatPath(path, file)) + "}());");
          _handlebars2.default.templates[file.replace('.hbs', '')] = _handlebars2.default.template(tmpl);
        }
      });
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new Manager(singletonEnforcer);
      }
      return this[singleton];
    }
  }]);

  return Manager;
}();

exports.default = Manager;