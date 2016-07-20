'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _editor = require('../controllers/editor');

var _abeLocale = require('../helpers/abe-locale');

var _abeLocale2 = _interopRequireDefault(_abeLocale);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var page = function page(req, res, next) {
  var templatePath = _cli.fileUtils.getTemplatePath(req.params[0]);
  var filePath = (0, _cli.cleanSlug)(req.query.filePath);
  filePath = _cli.fileUtils.getFilePath(filePath);
  var html = req.query.html ? true : false;
  var json = null;
  var editor = false;
  if (typeof req.body.json !== 'undefined' && req.body.json !== null) {
    editor = true;
    if (typeof req.body.json === 'string') {
      json = JSON.parse(req.body.json);
    } else {
      json = req.body.json;
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

    if (!editor) {

      _cli.Util.getDataList(_cli.fileUtils.removeLast(tplUrl.publish.link), text, json).then(function () {
        var page = new _cli.Page(templatePath, text, json, html);
        res.set('Content-Type', 'text/html');
        res.send(page.html);
      }).catch(function (e) {
        console.error(e);
      });
    } else {
      text = _cli.Util.removeDataList(text);
      var page = new _cli.Page(templatePath, text, json, html);
      res.set('Content-Type', 'text/html');
      res.send(page.html);
    }
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
      res.status(404).send('Not found');
    }
  }
};

exports.default = page;