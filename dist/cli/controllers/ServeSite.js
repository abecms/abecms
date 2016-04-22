'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _paperboy = require('paperboy');

var _paperboy2 = _interopRequireDefault(_paperboy);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServeSite = function () {
  function ServeSite() {
    _classCallCheck(this, ServeSite);
  }

  _createClass(ServeSite, [{
    key: 'start',
    value: function start(config) {
      var _this = this;

      this.config = config;
      this.webroot = _.fileUtils.concatPath(config.root, config.publish.url);
      if (config.siteUrl) {
        this.webroot = config.siteUrl;
        this.port = config.sitePort ? config.sitePort : 80;
        this._server = true;
        return;
      }
      this.port = config.webport;
      this._server = null;

      this._server = _http2.default.createServer(function (req, res) {
        var ip = req.connection.remoteAddress;
        _paperboy2.default.deliver(_this.webroot, req, res).addHeader('X-Powered-By', 'Abe').before(function () {
          console.log('Request received for ' + req.url);
        }).after(function (statusCode) {
          console.log(statusCode + ' - ' + req.url + ' ' + ip);
        }).error(function (statusCode, msg) {
          console.log([statusCode, msg, req.url, ip].join(' '));
          res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
          res.end('Error [' + statusCode + ']');
        }).otherwise(function (err) {
          console.log(__dirname + '/../../server/views/list.html');
          var text = _fsExtra2.default.readFileSync(__dirname + '/../../server/views/list.html', 'utf8');
          var files = _.FileParser.getFiles(_this.webroot, true, 10, new RegExp('.' + _this.config.files.templates.extension));
          var template = _handlebars2.default.compile(text);
          var compiled = template({ files: files });

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(compiled);
        });
      }).listen(this.port);

      console.log('paperboy on his round at http://localhost:' + this.port);
    }
  }, {
    key: 'server',
    get: function get() {
      return this._server;
    }
  }, {
    key: 'isStarted',
    get: function get() {
      return typeof this._server !== 'undefined' && this._server !== null;
    }
  }, {
    key: 'infos',
    get: function get() {
      return {
        webroot: this.webroot === _.fileUtils.concatPath(this.config.root, this.config.publish.url) ? 'http://localhost' : this.config.siteUrl,
        port: this.port
      };
    }
  }]);

  return ServeSite;
}();

exports.default = ServeSite;