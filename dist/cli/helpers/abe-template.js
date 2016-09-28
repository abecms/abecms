'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addOrder = addOrder;
exports.getAbeImport = getAbeImport;
exports.includePartials = includePartials;
exports.getTemplate = getTemplate;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _es6Promise = require('es6-promise');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addOrder(text) {
  var regAbe = /{{abe[\S\s].*?key=['|"]([\S\s].*?['|"| ]}})/g;
  var matches = text.match(regAbe);
  var order = 0;

  if (typeof matches !== 'undefined' && matches !== null) {
    Array.prototype.forEach.call(matches, function (match) {
      if (typeof match !== 'undefined' && match !== null) {

        var keyAttr = (0, _cli.getAttr)(match, 'key');
        var orderAttr = (0, _cli.getAttr)(match, 'order');

        if (typeof orderAttr === 'undefined' || orderAttr === null || orderAttr === '') {
          var matchOrder = match.replace(/\}\}$/, ' order=\'' + order + '\'}}');
          text = text.replace(match, matchOrder);
        }
        order++;
      }
    });
  }
  return text;
}

function getAbeImport(text) {
  var partials = [];
  var listReg = /({{abe.*?type=[\'|\"]import.*?}})/g;
  var match;
  while (match = listReg.exec(text)) {
    partials.push(match[0]);
  }

  return partials;
}

function includePartials(text) {
  var abeImports = getAbeImport(text);

  Array.prototype.forEach.call(abeImports, function (abeImport) {
    var obj = _cli.Util.getAllAttributes(abeImport, {});

    var file = obj.file;
    var partial = '';
    file = _path2.default.join(_cli.config.root, _cli.config.partials, file);
    if (_cli.fileUtils.isFile(file)) {
      partial = _fsExtra2.default.readFileSync(file, 'utf8');
    }
    text = text.replace((0, _cli.escapeTextToRegex)(abeImport, 'g'), partial);
  });

  return text;
}

function translate(text) {
  var importReg = /({{abe.*type=[\'|\"]translate.*}})/g;
  var match;

  var matches = text.match(importReg);
  var order = 0;

  if (typeof matches !== 'undefined' && matches !== null) {
    Array.prototype.forEach.call(matches, function (match) {
      var splitedMatches = match.split('{{abe ');

      Array.prototype.forEach.call(splitedMatches, function (splitedMatch) {
        var currentMatch = '{{abe ' + splitedMatch;
        if (/({{abe.*type=[\'|\"]translate.*}})/.test(currentMatch)) {
          var locale = (0, _cli.getAttr)(currentMatch, 'locale');
          var source = (0, _cli.getAttr)(currentMatch, 'source');

          if (locale.indexOf('{{') === -1) {
            locale = '\'' + locale + '\'';
          } else {
            locale = locale.replace(/\{\{(.*?)\}\}/, '$1');
          }

          if (source.indexOf('{{') === -1) {
            source = '\'' + source.replace(/'/g, '\\\'') + '\'';
          } else {
            source = source.replace(/\{\{(.*?)\}\}/, '$1');
          }

          // var replace = `{{{i18nAbe ${locale} ${source}}}}`
          var replace = currentMatch.replace('{{abe', '{{i18nAbe');
          replace = replace.replace(/locale=['|"].*?['|"]/, locale);
          replace = replace.replace(/source=['|"].*?['|"]/, source);
          replace = replace.replace(/{{i18nAbe.*?}}/, '{{{i18nAbe ' + locale + ' ' + source + '}}}');

          text = text.replace((0, _cli.escapeTextToRegex)(currentMatch, 'g'), replace);
        }
      });
    });
  }

  return text;
}

function getTemplate(file) {
  var text = '';

  // HOOKS beforeGetTemplate
  file = _cli.Hooks.instance.trigger('beforeGetTemplate', file);

  file = file.replace(_path2.default.join(_cli.config.root, _cli.config.templates.url), '');
  file = file.replace(_cli.config.root, '');
  if (file.indexOf('.') > -1) {
    file = _cli.fileUtils.removeExtension(file);
  }
  file = _path2.default.join(_cli.config.root, _cli.config.templates.url, file + '.' + _cli.config.files.templates.extension);
  if (_cli.fileUtils.isFile(file)) {
    text = _fsExtra2.default.readFileSync(file, 'utf8');
    text = includePartials(text);
    text = translate(text);
    text = addOrder(text);
  } else {
    text = '[ ERROR ] template ' + _cli.config.templates.url + ' doesn\'t exist anymore';
  }

  // HOOKS afterGetTemplate
  text = _cli.Hooks.instance.trigger('afterGetTemplate', text);

  return text;
}