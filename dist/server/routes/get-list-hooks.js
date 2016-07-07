'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _hooks = require('../../hooks/hooks');

var _hooks2 = _interopRequireDefault(_hooks);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  // var urls = []
  // Array.prototype.forEach.call(routes, function(route) {
  //   urls.push({
  //     url: route.route.path,
  //     method: Object.keys(route.route.methods)[0].toUpperCase(),
  //     regex: "^\\" + route.route.path.replace(/\*$/, '') + ".*?"
  //   })
  // })

  var page = _cli.fileUtils.concatPath(__dirname + '/../views/list-hooks.html');
  var html = _cli.fileUtils.getFileContent(page);
  var allHooks = [];

  Array.prototype.forEach.call(Object.keys(_hooks2.default), function (hook) {
    var hookString = _hooks2.default[hook] + '';
    var match = /\((.*?)\)/.exec(hookString);
    var matchReturn = /return ([a-z1-Z-1-9]+)/.exec(hookString);
    allHooks.push({
      name: hook,
      params: match ? match[1] : 'null',
      back: matchReturn ? matchReturn[1].replace(';', '') : 'null'
    });
  });
  // console.log('Plugins.instance.getHooks()', Plugins.instance.getHooks())

  var template = _handlebars2.default.compile(html, { noEscape: true });
  var tmp = template({
    hooks: allHooks
  });

  return res.send(tmp);
};

exports.default = route;