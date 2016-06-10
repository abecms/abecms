'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(req, res, next) {
  var file = _cli.fileUtils.concatPath(_cli.config.root, 'logs', req.params[0] + '.log');
  var html = '';
  if (_cli.fileUtils.isFile(file)) {
    var commonStyle = "font-family: arial; font-size: 12px;";
    var shellp = '<span style="color: #18FFFF;' + commonStyle + '"> > ' + req.params[0].replace(/\//g, '') + "</span>";
    var content = _fsExtra2.default.readFileSync(file, 'utf8');
    html = '<!doctype html>' + "\n" + '<html>' + "\n" + '<head>' + "\n" + '<style>body, html {background: #212121;}</style>' + "\n" + '</head>' + "\n" + '<body>';
    html += '<a href="/abe/logs" style="color: white;' + commonStyle + '">< Go back</a>';
    content = content.split("\n");
    Array.prototype.forEach.call(content, function (item) {
      if (typeof item !== 'undefined' && item !== null && item !== '') {

        var cut = item.split('---');
        var date = '';
        var text = '<span style="color: white; ' + commonStyle + '>' + item + '</span>';
        if (typeof cut[0] !== 'undefined' && cut[0] !== null && typeof cut[1] !== 'undefined' && cut[1] !== null) {
          date = cut[0].replace(/([0-9]{0,2}:[0-9]{0,2}:[0-9]{0,2})/, '<strong style="color: #B2FF59;">$1</strong>');
          date = "\n" + '<span style="color: #00E676; text-transform: uppercase; font-family: arial; font-size: 11px;"> [ ' + date + ' ] </span>';
          text = "\n" + '<span style="color: white; ' + commonStyle + '">' + cut[1] + '</span>';
        }
        html += "\n" + "<div>" + "\n" + date + "\n" + shellp + "\n" + text + "\n" + "</div>";
      }
    });
    html += "\n" + '</body>' + "\n" + '</html>';
  } else {
    var path = _cli.fileUtils.concatPath(_cli.config.root, 'logs');
    if (!_cli.folderUtils.isFolder(path)) {
      _mkdirp2.default.sync(path);
    }
    var files = _cli.FileParser.read(path, path, 'files', true, /\.log/, 99);
    html += '<a href="/abe/delete-logs">Go to delete logs</a>';
    html += '<br /><br /><div>Choose to see logs files</div>';
    html += '<ul>';
    Array.prototype.forEach.call(files, function (item) {
      html += '<li>';
      html += '<a href="/abe/logs/' + _cli.fileUtils.removeExtension(item.cleanPath) + '">' + item.name + '</a><br />';
      html += '</li>';
    });
    html += '</ul>';
  }
  res.send(html);
};

exports.default = route;