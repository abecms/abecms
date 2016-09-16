'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(req, res, next) {
  var file = _path2.default.join(_cli.config.root, 'logs', req.params[0] + '.log');
  var html = '';
  if (_cli.fileUtils.isFile(file)) {
    _fsExtra2.default.removeSync(file);
    res.redirect('/abe/delete-logs/');
  } else {
    var pathDelete = _path2.default.join(_cli.config.root, 'logs');
    var files = _cli.FileParser.read(pathDelete, pathDelete, 'files', true, /\.log/, 99);

    html += '<a href="/abe/logs">Go to logs</a>';
    html += '<br /><br /><div>Choose to remove logs files</div>';
    html += '<ul>';
    Array.prototype.forEach.call(files, function (item) {
      html += '<li>';
      html += '<a href="/abe/delete-logs/' + _cli.fileUtils.removeExtension(item.cleanPath) + '">' + item.name + '</a><br />';
      html += '</li>';
    });
    html += '</ul>';
    res.send(html);
  }
};

exports.default = route;