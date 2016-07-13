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

var _page = require('../helpers/page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(req, res, next) {
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
      filePath = _cli.fileUtils.concatPath(folderFilePath, (0, _cli.cleanSlug)(filename));
      resp['filePath'] = _cli.fileUtils.concatPath(folderWebPath, (0, _cli.cleanSlug)(filename));
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
};

exports.default = route;