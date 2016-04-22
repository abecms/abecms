'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = abeImport;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _ = require('../../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function abeImport(file, config, ctx) {
  file = _.Hooks.instance.trigger('beforeImport', file, config, ctx);

  var config = JSON.parse(config);
  var intlData = config.intlData;
  var defaultPartials = __dirname.replace(/\/$/, "") + '/' + config.defaultPartials.replace(/\/$/, "");
  var partials = config.partials !== '' ? config.root.replace(/\/$/, "") + '/' + config.partials.replace(/\/$/, "") : defaultPartials;
  var pathToPartial = partials + '/' + file + '.html';
  try {
    var stat = _fsExtra2.default.statSync(pathToPartial);
  } catch (e) {
    var pathToPartial = defaultPartials + '/' + file + '.html';
  }
  if (_.fileUtils.isFile(pathToPartial)) {
    var html = _fsExtra2.default.readFileSync(pathToPartial, 'utf8');
  } else {
    html = '';
  }

  var pluginsPartials = _.Plugins.instance.getPartials();
  Array.prototype.forEach.call(pluginsPartials, function (pluginPartials) {
    var checkFile = _.fileUtils.concatPath(pluginPartials, file + '.html');
    if (_.fileUtils.isFile(checkFile)) {
      html += _fsExtra2.default.readFileSync(checkFile, 'utf8');
    }
  });
  var template = _handlebars2.default.compile(html);
  var res = new _handlebars2.default.SafeString(template(ctx, { data: { intl: intlData } }));

  res = _.Hooks.instance.trigger('afterImport', res, file, config, ctx);

  return res;
}