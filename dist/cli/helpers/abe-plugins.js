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

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Plugins = function () {
  function Plugins(enforcer) {
    _classCallCheck(this, Plugins);

    if (enforcer != singletonEnforcer) throw "Cannot construct Plugins singleton";
    this._plugins = [];
    this.fn = [];
    var pluginsDir = _path2.default.join(_.config.root, _.config.plugins.url);
    if (_.folderUtils.isFolder(pluginsDir)) {
      this._plugins = _.FileParser.getFolders(pluginsDir, true, 0);
      Array.prototype.forEach.call(this._plugins, function (plugin) {
        // has hooks
        var plugHooks = _path2.default.join(plugin.path, _.config.hooks.url);
        if (_.folderUtils.isFolder(plugHooks)) {
          var plugHooksFile = _path2.default.join(plugHooks, 'hooks.js');
          var h = require(plugHooksFile);
          plugin.hooks = h.default;
        } else {
          plugin.hooks = null;
        }

        // has partials
        var plugPartials = _path2.default.join(plugin.path, _.config.pluginsPartials);
        if (_.folderUtils.isFolder(plugPartials)) {
          plugin.partials = plugPartials;
        } else {
          plugin.partials = null;
        }

        // has templates
        var plugTemplates = _path2.default.join(plugin.path, _.config.templates.url);
        if (_.folderUtils.isFolder(plugTemplates)) {
          plugin.templates = plugTemplates;
        } else {
          plugin.templates = null;
        }

        // has routes
        var plugRoutes = _path2.default.join(plugin.path, 'routes');
        if (_.folderUtils.isFolder(plugRoutes)) {
          plugin.routes = {};

          var gets = _path2.default.join(plugRoutes, 'get');
          if (_.folderUtils.isFolder(gets)) {
            var routesGet = _.FileParser.getFiles(gets, true, 0);
            Array.prototype.forEach.call(routesGet, function (route) {
              route.routePath = '/abe/plugin/' + plugin.name + '/' + route.name.replace('.js', '') + '*';
            });
            plugin.routes.get = routesGet;
          }

          var posts = _path2.default.join(plugRoutes, 'post');
          if (_.folderUtils.isFolder(posts)) {
            var routesPost = _.FileParser.getFiles(posts, true, 0);
            Array.prototype.forEach.call(routesPost, function (route) {
              route.routePath = '/abe/plugin/' + plugin.name + '/' + route.name.replace('.js', '') + '*';
            });
            plugin.routes.post = routesPost;
          }
        } else {
          plugin.routes = null;
        }
      });
    }
  }

  _createClass(Plugins, [{
    key: 'hooks',
    value: function hooks() {
      var _this = this;

      if (arguments.length > 0) {
        var args = [].slice.call(arguments);
        var fn = args.shift();

        if (typeof this._plugins !== 'undefined' && this._plugins !== null) {
          Array.prototype.forEach.call(this._plugins, function (plugin) {
            if (typeof plugin.hooks !== 'undefined' && plugin.hooks !== null && typeof plugin.hooks[fn] !== 'undefined' && plugin.hooks[fn] !== null) {
              args[0] = plugin.hooks[fn].apply(_this, args);
            }
          });
        }
      }

      return args[0];
    }
  }, {
    key: 'getHooks',
    value: function getHooks() {
      return this._plugins;
    }
  }, {
    key: 'getPartials',
    value: function getPartials() {
      var partials = [];
      Array.prototype.forEach.call(this._plugins, function (plugin) {
        if (typeof plugin.partials !== 'undefined' && plugin.partials !== null) {
          partials.push(plugin.partials);
        }
      });

      return partials;
    }
  }, {
    key: 'getRoutes',
    value: function getRoutes() {
      var routes = [];
      Array.prototype.forEach.call(this._plugins, function (plugin) {
        if (typeof plugin.routes !== 'undefined' && plugin.routes !== null) {
          routes = routes.concat(plugin.routes);
        }
      });

      return routes;
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new Plugins(singletonEnforcer);
      }
      return this[singleton];
    }
  }]);

  return Plugins;
}();

exports.default = Plugins;