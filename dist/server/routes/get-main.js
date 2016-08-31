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

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _editor = require('../controllers/editor');

var _abeLocale = require('../helpers/abe-locale');

var _abeLocale2 = _interopRequireDefault(_abeLocale);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(req, res, next) {
  var dateStart = new Date();

  if (req.query.filePath) {
    var testXSS = (0, _xss2.default)(req.query.filePath, {
      whiteList: [],
      stripIgnoreTag: true
    });
    if (testXSS !== req.query.filePath) {
      // res.status(400).send('<h1>400 Bad Request</h1>Not a valid URL format');
      res.redirect('/abe/' + req.params[0] + '?filePath=' + testXSS);
      return;
    }
  }
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var templatePath = _cli.fileUtils.getTemplatePath(req.params[0]);
  var filePath = _cli.fileUtils.getFilePath(req.query.filePath);
  var debugJson = req.query.debugJson && req.query.debugJson == 'true' ? true : false;
  var debugJsonKey = req.query.key ? req.query.key : false;
  var debugHtml = req.query.debugHtml && req.query.debugHtml == 'true' ? true : false;

  var isHome = true;

  var p = new Promise(function (resolve, reject) {

    if (templatePath !== null && filePath !== null) {
      var folderFilePath;
      var files;
      var latest;
      var fakeContent;

      var _ret = function () {

        isHome = false;

        if (!_cli.fileAttr.test(filePath)) {
          folderFilePath = filePath.split('/');

          folderFilePath.pop();
          folderFilePath = _cli.fileUtils.pathWithRoot(folderFilePath.join('/'));
          _mkdirp2.default.sync(folderFilePath);
          files = _cli.FileParser.getFiles(folderFilePath, true, 2);
          latest = _cli.fileAttr.filterLatestVersion(_cli.fileAttr.getFilesRevision(files, filePath), 'draft');

          if (latest.length) {
            filePath = latest[0].path;
          }
        }

        var tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
        fakeContent = req.query.fakeContent ? true : false;


        if (!_cli.fileUtils.isFile(tplUrl.json.path)) {
          res.redirect("/abe/");
          return {
            v: void 0
          };
        }

        (0, _editor.editor)(templatePath, tplUrl, fakeContent).then(function (result) {
          var manager = {};

          _cli.FileParser.getAssetsFolder();
          _cli.FileParser.getAssets();

          var revisionFilePath = _cli.FileParser.changePathEnv(filePath, _cli.config.draft.url);
          var dirPath = _cli.fileUtils.removeLast(revisionFilePath);
          var allDraft = _cli.FileParser.getFiles(dirPath, true, 99, new RegExp("\\." + _cli.config.files.templates.extension));

          allDraft = _cli.FileParser.getMetas(allDraft, 'draft');
          var breadcrumb = req.params[0].split('/');
          manager.file = {
            revision: _cli.fileAttr.getFilesRevision(allDraft, _cli.fileAttr.delete(revisionFilePath)),
            template: breadcrumb,
            path: req.query.filePath ? _cli.fileUtils.cleanTplName(req.query.filePath) : ''
          };
          if (manager.file.revision.length > 0) {
            var publishPath = _cli.fileAttr.delete(manager.file.revision[0].path.replace(new RegExp('/' + _cli.config.draft.url + '/'), '/' + _cli.config.publish.url + '/'));
            manager.file.isPublished = _cli.fileUtils.isFile(publishPath);
          }

          resolve({
            obj: result,
            manager: manager,
            tplUrl: tplUrl
          });
        }).catch(function (e) {
          console.error(e);
        });
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else {
      resolve({
        obj: {},
        manager: {}
      });
    }
  }).catch(function (e) {
    console.error(e); // "oh, no!"
  });

  p.then(function (result) {
    var obj = result.obj;
    var manager = result.manager;
    var tplUrl = result.tplUrl;

    manager.home = {
      files: _cli.Manager.instance.getList()
    };

    manager.list = req.app.get('projectFiles');
    manager.editConfig = req.app.get('config');
    manager.config = JSON.stringify(_cli.config);

    var _hasBlock = obj ? obj.hasBlock : false;
    var _hasSingleBlock = obj ? obj.hasSingleBlock : false;
    var _template = filePath ? '/page/' + req.params[0] + ('?filePath=' + req.query.filePath) : false;
    var _form = obj ? obj.form : false;
    var _json = obj ? obj.json : false;
    var _text = obj ? obj.text : false;
    var _file = tplUrl ? tplUrl.draft.file : false;
    var _filePath = req.query.filePath ? req.query.filePath : false;
    if (_filePath) {
      _filePath = '/' + _filePath.replace(/^\/+/, '');
    }

    var pageHtml = '';
    if (typeof _json !== 'undefined' && _json !== null && typeof _json.abe_meta !== 'undefined' && _json.abe_meta !== null) {
      var text = (0, _cli.getTemplate)(_json.abe_meta.template);
      var page = new _cli.Page(req.params[0], text, _json, false);
      pageHtml = page.html.replace(/"/g, '\"').replace(/'/g, "\'");
    }

    var EditorVariables = {
      pageHtml: pageHtml,
      isHome: isHome,
      abeUrl: '/abe/',
      test: JSON.stringify(_abeLocale2.default),
      text: _abeLocale2.default,
      templatePath: req.params[0],
      template: _template,
      hasSingleBlock: _hasSingleBlock,
      hasBlock: _hasBlock,
      form: _form,
      urlToSaveFile: _filePath,
      tplName: _file,
      json: _json,
      config: _cli.config,
      Locales: _cli.Locales.instance.i18n,
      manager: manager,
      express: {
        res: res,
        req: req
      },
      abeVersion: _package2.default.version,
      nonce: "'nonce-" + res.locals.nonce + "'"
    };
    var EditorVariables = _cli.Hooks.instance.trigger('afterVariables', EditorVariables);

    if (debugJson) {
      var dj = _json;
      if (debugJsonKey && typeof dj[debugJsonKey] !== 'undefined' && dj[debugJsonKey] !== null) {
        dj = dj[debugJsonKey];
      }
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(dj));
    } else if (debugHtml) {
      res.set('Content-Type', 'text/plain');
      res.send(_text);
    } else {
      _cli.log.duration('load page: ' + _filePath, (new Date().getTime() - dateStart.getTime()) / 1000);
      res.render(_cli.config.abeEngine, EditorVariables);
    }
  }).catch(function (e) {
    console.log('error', e);
  });
};

exports.default = route;