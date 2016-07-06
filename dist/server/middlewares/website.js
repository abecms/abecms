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

var middleware = function middleware(req, res, next) {
  if (req.originalUrl.indexOf('/abe/') > -1 || req.originalUrl.indexOf('/plugin/') > -1) {
    return next();
  }

  if (req.originalUrl === '' || req.originalUrl === '/' || req.originalUrl.indexOf('.') === -1) {
    var path = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.publish.url, req.originalUrl);
    if (!_cli.folderUtils.isFolder(path)) {
      return next();
    }
    var files = _cli.FileParser.getFiles(path, true, 0, /(.*?)/);

    var folders = _cli.FileParser.getFolders(path, true, 0);
    var html = '<ul>';
    html += '<li><a href="/abe/">abe</abe></li>';
    html += '<br />';
    if (req.originalUrl !== '/' && req.originalUrl !== '') {
      var parent = req.originalUrl.replace(/\/$/, '').split('/');
      parent.pop();
      parent = parent.join('/') + '/';
      html += '<li><a href="' + parent + '">../</abe></li>';
    }

    if (typeof folders !== 'undefined' && folders !== null) {

      Array.prototype.forEach.call(folders, function (folder) {
        var url = folder.path.replace(_cli.config.root, '').replace(_cli.config.publish.url, '');
        html += '<li><a href="' + url + '">/' + folder.cleanPath + '</a></li>';
      });
    }
    if (typeof files !== 'undefined' && files !== null) {
      Array.prototype.forEach.call(files, function (file) {
        var url = file.path.replace(_cli.config.root, '').replace(_cli.config.publish.url, '');
        html += '<li><a href="' + url + '">' + file.cleanPath + '</a></li>';
      });
    }
    html += '</ul>';

    res.set('Content-Type', 'text/html');
    return res.send(html);
  } else if (req.originalUrl.indexOf('.' + _cli.config.files.templates.extension) > -1) {

    var html = '';

    var page = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.publish.url, req.originalUrl);
    if (_cli.fileUtils.isFile(page)) {
      html = _cli.fileUtils.getFileContent(page);
    } else {
      return next();
    }
    res.set('Content-Type', 'text/html');
    return res.send(html);
  } else {
    return next();
  }
};

exports.default = middleware;