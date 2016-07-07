'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _htmlMinifier = require('html-minifier');

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _cli = require('../../cli');

var abe = _interopRequireWildcard(_cli);

var _xss = require('xss');

var _xss2 = _interopRequireDefault(_xss);

var _package = require('../../../package');

var _package2 = _interopRequireDefault(_package);

var _routes = require('../routes');

var _abeLocale = require('../helpers/abe-locale');

var _abeLocale2 = _interopRequireDefault(_abeLocale);

var _page = require('../helpers/page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
_cli.Hooks.instance.trigger('afterHandlebarsHelpers', _cli.Handlebars);
_cli.Hooks.instance.trigger('beforeAddRoute', router);

router.get('/abe/logs*', _routes.getLogs);
router.get('/abe/delete-logs*', _routes.getDeleteLogs);
router.get('/abe/create*', _routes.getCreate);
router.get('/abe/duplicate*', _routes.getDuplicate);
router.get('/abe/update*', _routes.getUpdate);
router.post('/page/*', _routes.postPage);
router.get('/page/*', _routes.getPage);
router.post('/publish', _routes.postPublish);
router.get('/abe/republish', _routes.getRepublish);
router.post('/reject', _routes.postReject);
router.post('/draft', _routes.postDraft);
router.get('/save-config', _routes.getSaveConfig);
router.get('/unpublish', _routes.getUnpublish);
router.get('/delete', _routes.getDelete);
router.post('/upload/*', _routes.postUpload);
router.get('/abe/list-url*', function (req, res, next) {
  (0, _routes.getListUrl)(router, req, res, next);
});
router.get('/abe/list-hooks*', _routes.getListHooks);
router.get('/abe*', _routes.getMain);

var routes = _cli.Plugins.instance.getRoutes();
Array.prototype.forEach.call(routes, function (route) {
  if (typeof route.get !== 'undefined' && route.get !== null) {
    Array.prototype.forEach.call(route.get, function (routeGet) {
      try {
        var pluginRoot = require(routeGet.path);
        if (_typeof(pluginRoot.default) === 'object') {
          router.get(routeGet.routePath, pluginRoot.default);
        } else {
          router.get(routeGet.routePath, function (req, res, next) {
            pluginRoot.default(req, res, next, abe);
          });
        }
      } catch (e) {
        // statements
        console.log(e);
      }
    });
  }
  if (typeof route.post !== 'undefined' && route.post !== null) {
    Array.prototype.forEach.call(route.post, function (routePost) {
      try {
        var pluginRoot = require(routePost.path);
        if (_typeof(pluginRoot.default) === 'object') {
          router.post(routePost.routePath, pluginRoot.default);
        } else {
          router.post(routePost.routePath, function (req, res, next) {
            pluginRoot.default(req, res, next, abe);
          });
        }
      } catch (e) {
        // statements
        console.log(e);
      }
    });
  }
});

_cli.Hooks.instance.trigger('afterAddRoute', router);

exports.default = router;