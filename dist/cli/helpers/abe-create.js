'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var create = function create(template, path, name, req) {
  var forceJson = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
  var duplicate = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

  var p = new Promise(function (resolve, reject) {
    _cli.Hooks.instance.trigger('beforeCreate', template, path, name, req, forceJson);

    var templatePath = _cli.fileUtils.getTemplatePath(template.replace(_cli.config.root, ""));
    var filePath = _cli.fileUtils.concatPath(path, name);
    filePath = (0, _cli.cleanSlug)(filePath);
    filePath = _cli.fileUtils.getFilePath(filePath);

    if (templatePath !== null && filePath !== null) {
      var tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);

      if (!_cli.fileUtils.isFile(tplUrl.json.path)) {
        var json = forceJson ? forceJson : {};
        var tpl = templatePath;
        var text = (0, _cli.getTemplate)(tpl);
        if (duplicate) {
          json = removeDuplicateAttr(text, json);
        }
        text = _cli.Util.removeDataList(text);
        var resHook = _cli.Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text);
        filePath = resHook.filePath;
        json = resHook.json;
        text = resHook.text;

        _cli.Hooks.instance.trigger('afterCreate', json, text, path, name, req, forceJson);
        (0, _cli.save)(filePath, req.query.selectTemplate, json, text, 'draft', null, 'draft').then(function (resSave) {
          _cli.Manager.instance.updateList();
          filePath = resSave.htmlPath;
          tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
          resolve(resSave.json);
        }).catch(function (e) {
          reject();
          console.error(e);
        });
      } else {
        var json = _cli.FileParser.getJson(tplUrl.json.path);
        resolve(json, tplUrl.json.path);
      }
    } else {
      reject();
    }
  }).catch(function (e) {
    console.error(e);
    reject();
  });

  return p;
};

exports.default = create;