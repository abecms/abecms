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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(req, res, next) {
  var file = _cli.fileUtils.concatPath(_cli.config.root, 'logs', req.params[0] + '.log');
  var html = '';
  if (_cli.fileUtils.isFile(file)) {
    _fsExtra2.default.removeSync(file);
    res.redirect('/abe/delete-logs/');
  } else {
    var path = _cli.fileUtils.concatPath(_cli.config.root, 'logs');
    var files = _cli.FileParser.read(path, path, 'files', true, /\.log/, 99);

    html += '<a href="/abe/logs">Go to logs</a>';
    html += '<br /><br /><div>Choose to remove logs files</div>';
    html += '<ul>';
    Array.prototype.forEach.call(files, function (item) {
      html += '<li>';
      html += '<a href="/delete-logs/' + _cli.fileUtils.removeExtension(item.cleanPath) + '">' + item.name + '</a><br />';
      html += '</li>';
    });
    html += '</ul>';
    res.send(html);
  }
};

exports.default = route;