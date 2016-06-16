'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var create = function create(template, path, name, req) {
  var forceJson = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

  var p = new Promise(function (resolve, reject) {

    var templatePath = _cli.fileUtils.getTemplatePath(template);
    var filePath = _cli.fileUtils.getFilePath(_cli.fileUtils.concatPath(path, name));

    filePath = (0, _cli.cleanSlug)(filePath);

    if (templatePath !== null && filePath !== null) {
      var tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
      if (!_cli.fileUtils.isFile(tplUrl.json.path)) {
        var json = forceJson ? forceJson : {};
        var tpl = templatePath;
        var text = (0, _cli.getTemplate)(tpl);
        text = _cli.Util.removeDataList(text);
        var resHook = _cli.Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text);
        filePath = resHook.filePath;
        json = resHook.json;
        text = resHook.text;

        (0, _cli.save)(filePath, req.query.selectTemplate, json, text, 'draft', null, 'draft').then(function (resSave) {
          filePath = resSave.htmlPath;
          tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
          resolve(resSave.json);
        }).catch(function (e) {
          reject();
          console.error(e.stack);
        });
      } else {
        var json = _cli.FileParser.getJson(tplUrl.json.path);
        resolve(json);
      }
    } else {
      reject();
    }
  }).catch(function (e) {
    console.error(e.stack);
    reject();
  });

  return p;
};

exports.default = create;