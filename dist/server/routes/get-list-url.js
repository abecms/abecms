'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(router, req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  var routes = router.stack;
  var urls = [];
  Array.prototype.forEach.call(routes, function (route) {
    urls.push({
      url: route.route.path,
      method: Object.keys(route.route.methods)[0].toUpperCase(),
      regex: "^\\" + route.route.path.replace(/\*$/, '') + ".*?"
    });
  });

  var page = _cli.fileUtils.concatPath(__dirname + '/../views/list-url.html');
  var html = _cli.fileUtils.getFileContent(page);

  var template = _handlebars2.default.compile(html, { noEscape: true });
  var tmp = template({
    urls: urls
  });

  return res.send(tmp);

  res.set('Content-Type', 'text/html');
  res.send('working !');
};

exports.default = route;