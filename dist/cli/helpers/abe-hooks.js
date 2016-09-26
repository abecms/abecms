'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hooks = require('../../hooks/hooks');

var _hooks2 = _interopRequireDefault(_hooks);

var _ = require('../');

var abe = _interopRequireWildcard(_);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Hooks = function () {
  function Hooks(enforcer) {
    _classCallCheck(this, Hooks);

    if (enforcer != singletonEnforcer) throw 'Cannot construct Json singleton';

    if (_.fileUtils.isFile(_path2.default.join(_.config.root, _.config.hooks.url, 'hooks.js'))) {
      var h = require(_path2.default.join(_.config.root, _.config.hooks.url, 'hooks.js'));
      this.fn = (0, _extend2.default)(true, _hooks2.default, h.default);
    } else {
      this.fn = _hooks2.default;
    }
  }

  _createClass(Hooks, [{
    key: 'trigger',
    value: function trigger() {
      if (arguments.length > 0) {
        var args = [].slice.call(arguments);
        var fn = args.shift();
        args.push(abe);

        if (typeof this.fn !== 'undefined' && this.fn !== null && typeof this.fn[fn] !== 'undefined' && this.fn[fn] !== null) {
          args[0] = this.fn[fn].apply(this, args);
        }

        args[0] = _.Plugins.instance.hooks.apply(_.Plugins.instance, [fn].concat(args));
      }

      return args[0];
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new Hooks(singletonEnforcer);
      }
      return this[singleton];
    }
  }]);

  return Hooks;
}();

exports.default = Hooks;