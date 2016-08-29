'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cli = require('../../cli');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Manager = function () {
  function Manager(enforcer) {
    _classCallCheck(this, Manager);

    if (enforcer != singletonEnforcer) throw "Cannot construct Json singleton";

    this._list = _cli.FileParser.getAllFiles();
    this._list[0].files.sort(_cli.FileParser.predicatBy('date', -1));
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