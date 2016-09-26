'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var abeEngine = function () {
  function abeEngine(enforcer) {
    _classCallCheck(this, abeEngine);

    if (enforcer != singletonEnforcer) throw 'Cannot construct Json singleton';
    this._content = {};
  }

  _createClass(abeEngine, [{
    key: 'content',
    get: function get() {
      return this._content;
    },
    set: function set(content) {
      this._content = content;
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new abeEngine(singletonEnforcer);
      }
      return this[singleton];
    }
  }]);

  return abeEngine;
}();

exports.default = abeEngine;