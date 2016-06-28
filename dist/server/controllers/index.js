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

var _editor = require('./editor');

var _abeLocale = require('../helpers/abe-locale');

var _abeLocale2 = _interopRequireDefault(_abeLocale);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
_cli.Hooks.instance.trigger('afterHandlebarsHelpers', _cli.Handlebars);
_cli.Hooks.instance.trigger('beforeAddRoute', router);

// Abe templating engine route
router.get('/abe/*', function (req, res, next) {
  if (req.query.filePath) {
    var testXSS = (0, _xss2.default)(req.query.filePath, {
      whiteList: [],
      stripIgnoreTag: true
    });
    // stripIgnoreTagBody: ['script']
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

  filePath = (0, _cli.cleanSlug)(filePath);

  var obj;
  var tplUrl;
  var isHome = true;
  var manager = {};

  var p = new Promise(function (resolve, reject) {

    if (templatePath !== null && filePath !== null) {

      isHome = false;

      if (!_cli.fileAttr.test(filePath)) {
        var folderFilePath = filePath.split('/');
        folderFilePath.pop();
        folderFilePath = _cli.fileUtils.pathWithRoot(folderFilePath.join('/'));
        _mkdirp2.default.sync(folderFilePath);
        var files = _cli.FileParser.getFiles(folderFilePath, true, 2);
        var latest = _cli.fileAttr.filterLatestVersion(_cli.fileAttr.getFilesRevision(files, filePath), 'draft');
        if (latest.length) {
          filePath = latest[0].path;
        }
      }

      tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
      var fakeContent = req.query.fakeContent ? true : false;

      var p2 = new Promise(function (resolve2, reject2) {
        if (!_cli.fileUtils.isFile(tplUrl.json.path)) {
          var json = {};
          var tpl = templatePath;
          var text = (0, _cli.getTemplate)(tpl);
          text = _cli.Util.removeDataList(text);
          var resHook = _cli.Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text);
          filePath = resHook.filePath;
          json = resHook.json;
          text = resHook.text;
          (0, _cli.save)(filePath, req.params[0], json, text, 'draft', null, 'draft').then(function (resSave) {
            filePath = resSave.htmlPath;
            tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
            resolve2();
          }).catch(function (e) {
            console.error(e.stack);
          });
        } else {
          resolve2();
        }
      });

      p2.then(function () {

        (0, _editor.editor)(templatePath, tplUrl, fakeContent).then(function (res) {
          obj = res;

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
          resolve();
        }).catch(function (e) {
          console.error(e.stack);
        });
      }).catch(function (e) {
        console.error(e.stack);
      });
    } else {
      resolve();
    }
  }).catch(function (e) {
    console.error(e.stack); // "oh, no!"
  });

  p.then(function () {

    manager.home = {
      files: _cli.FileParser.getAllFiles()
    };

    manager.list = _cli.FileParser.getProjetFiles();
    manager.editConfig = _cli.config.getConfigByWebsite();
    manager.config = JSON.stringify(_cli.config);

    var _hasBlock = obj ? obj.hasBlock : false;
    var _hasSingleBlock = obj ? obj.hasSingleBlock : false;
    var _template = filePath ? '/page/' + req.params[0] + ('?filePath=' + req.query.filePath) : false;
    var _form = obj ? obj.form : false;
    var _json = obj ? obj.json : false;
    var _file = tplUrl ? tplUrl.draft.file : false;
    var _filePath = req.query.filePath ? req.query.filePath : false;

    var EditorVariables = {
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

    res.render(_cli.config.abeEngine, EditorVariables);
  });
});

function page(req, res, next) {
  var templatePath = _cli.fileUtils.getTemplatePath(req.params[0]);
  var filePath = (0, _cli.cleanSlug)(req.query.filePath);
  filePath = _cli.fileUtils.getFilePath(filePath);
  var html = req.query.html ? true : false;
  var json = null;
  if (typeof req.query.json !== 'undefined' && req.query.json !== null) {
    if (typeof req.query.json === 'string') {
      json = JSON.parse(req.query.json);
    } else {
      json = req.query.json;
    }
  }

  if (typeof filePath !== 'undefined' && filePath !== null) {

    if (!_cli.fileAttr.test(filePath)) {
      var folderFilePath = filePath.split('/');
      folderFilePath.pop();
      folderFilePath = _cli.fileUtils.pathWithRoot(folderFilePath.join('/'));
      _mkdirp2.default.sync(folderFilePath);
      var files = _cli.FileParser.getFiles(folderFilePath, true, 2);
      var latest = _cli.fileAttr.filterLatestVersion(_cli.fileAttr.getFilesRevision(files, filePath), 'draft');
      if (latest.length) {
        filePath = latest[0].path;
      }
    }

    var tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);

    _cli.log.write('Index-route-page', 'templatePath', templatePath, 'tplUrl', tplUrl);

    if (typeof json === 'undefined' || json === null) {
      json = _cli.FileParser.getJson(tplUrl.json.path);
    }

    var meta = _cli.config.meta.name;
    var extension = _cli.config.files.templates.extension;

    var template = '';
    if (typeof json[meta] !== 'undefined' && json[meta] !== null && json[meta] !== '' && json[meta].template !== 'undefined' && json[meta].template !== null && json[meta].template !== '') {
      template = json[meta].template;
    } else {
      template = _cli.fileUtils.getTemplatePath(req.params[0]);
    }
    var text = (0, _cli.getTemplate)(template);

    _cli.Util.getDataList(_cli.fileUtils.removeLast(tplUrl.publish.link), text, json).then(function () {
      var page = new _cli.Page(templatePath, text, json, html);
      res.set('Content-Type', 'text/html');
      res.send(page.html);
    }).catch(function (e) {
      console.error(e.stack);
    });
  } else {
    // not 404 page if tag abe image upload into each block
    if (/upload%20image/g.test(req.url)) {
      var b64str = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      var img = new Buffer(b64str, 'base64');

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': img.length
      });
      res.end(img);
    } else {
      _cli.log.write('Index-route-page', '404 not found', 'filePath', filePath);
      res.status(404).send('Not found');
    }
  }
}

// Template page route
router.post('/page/*', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  page(req, res, next);
});

// Template page route
router.get('/page/*', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  page(req, res, next);
});

router.post('/publish', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = (0, _cli.cleanSlug)(req.body.filePath);
  var p = new Promise(function (resolve, reject) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(filePath), req.body.tplPath, req.body.json, '', 'draft', null, 'publish').then(function () {
      resolve();
    }).catch(function (e) {
      console.error(e.stack);
    });
  });

  p.then(function (resSave) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(req.body.filePath), req.body.tplPath, req.body.json, '', 'publish', resSave, 'publish').then(function (resSave) {
      if (typeof resSave.error !== 'undefined' && resSave.error !== null) {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({ error: resSave.error }));
      }
      var result;
      if (typeof resSave.reject !== 'undefined' && resSave.reject !== null) {
        result = resSave;
      }
      if (typeof resSave.json !== 'undefined' && resSave.json !== null) {
        result = {
          success: 1,
          json: resSave.json
        };
      }
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
    });
  }).catch(function (e) {
    console.error(e.stack);
  });
});

router.post('/reject', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var p = new Promise(function (resolve, reject) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(req.body.filePath), req.body.tplPath, req.body.json, '', 'draft', null, 'reject').then(function () {
      resolve();
    }).catch(function (e) {
      console.error(e.stack);
    });
  });

  p.then(function (resSave) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(req.body.filePath), req.body.tplPath, req.body.json, '', 'reject', resSave, 'reject').then(function (resSave) {
      if (typeof resSave.error !== 'undefined' && resSave.error !== null) {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({ error: resSave.error }));
      }
      var result;
      if (typeof resSave.reject !== 'undefined' && resSave.reject !== null) {
        result = resSave;
      }
      if (typeof resSave.json !== 'undefined' && resSave.json !== null) {
        result = {
          success: 1,
          json: resSave.json
        };
      }
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
    });
  }).catch(function (e) {
    console.error(e.stack);
  });
});

router.post('/draft', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  (0, _cli.save)(_cli.fileUtils.getFilePath(req.body.filePath), req.body.tplPath, req.body.json, '', 'draft', null, 'draft').then(function (resSave) {
    if (typeof resSave.error !== 'undefined' && resSave.error !== null) {
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({ error: resSave.error }));
    }
    var result;
    if (typeof resSave.reject !== 'undefined' && resSave.reject !== null) {
      result = resSave;
    }
    if (typeof resSave.json !== 'undefined' && resSave.json !== null) {
      result = {
        success: 1,
        json: resSave.json
      };
    }
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.get('/save-config', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  _cli.config.save(req.query.website, req.query.json);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(req.query.json));
});

router.get('/unpublish', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = (0, _cli.cleanSlug)(req.query.filePath);
  var dirPath = _cli.FileParser.unpublishFile(filePath);

  var result = {
    success: 1,
    file: req.query.filePath
  };
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
});

router.get('/delete', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = (0, _cli.cleanSlug)(req.query.filePath);
  var dirPath = _cli.FileParser.deleteFile(filePath);

  var result = {
    success: 1,
    file: req.query.filePath
  };
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
});

router.get('/', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  res.redirect('/abe/');
});

router.post('/upload/*', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var resp = { success: 1 };
  var filePath;
  var fstream;
  var folderWebPath = '/' + _cli.config.upload.image;
  folderWebPath = _cli.Hooks.instance.trigger('beforeSaveImage', folderWebPath, req);
  var folderFilePath = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.publish.url, folderWebPath);
  _mkdirp2.default.sync(folderFilePath);
  req.pipe(req.busboy);
  var size = 0;
  var hasError = false;
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var ext = filename.split('.');
    ext = ext[ext.length - 1].toLowerCase();
    file.fileRead = [];

    var returnErr = function returnErr(msg) {
      file.resume();
      hasError = true;
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify({ error: 1, response: msg }));
    };

    file.on('limit', function () {
      req.unpipe(req.busboy);
      returnErr('file to big');
    });

    file.on('data', function (chunk) {
      file.fileRead.push(chunk);
    });

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png' && mimetype !== 'image/svg+xml') {
      returnErr('unauthorized file');
    } else if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png' && ext !== 'svg') {
      returnErr('not an image');
    }

    file.on('end', function () {
      if (hasError) return;
      filePath = _cli.fileUtils.concatPath(folderFilePath, filename);
      resp['filePath'] = _cli.fileUtils.concatPath(folderWebPath, filename);
      fstream = _fs2.default.createWriteStream(filePath);
      for (var i = 0; i < file.fileRead.length; i++) {
        fstream.write(file.fileRead[i]);
      }
      fstream.on('close', function () {});
    });
  });
  req.busboy.on('finish', function () {
    if (hasError) return;
    resp = _cli.Hooks.instance.trigger('afterSaveImage', resp, req);
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(resp));
  });
});

var site = new _cli.serveSite();

router.get('/site*', function (req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  if (!site.isStarted) site.start(_cli.config);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(site.infos));
});

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