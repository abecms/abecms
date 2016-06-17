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
    _cli.log.write('create', '********************************************');
    _cli.log.write('create', 'cleanSlug: ' + filePath.replace(_cli.config.root, ''));

    if (templatePath !== null && filePath !== null) {
      var tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
      _cli.log.write('create', 'test if ' + tplUrl.json.path.replace(_cli.config.root, "") + ' exit');
      if (!_cli.fileUtils.isFile(tplUrl.json.path)) {
        _cli.log.write('create', 'json found');
        var json = forceJson ? forceJson : {};
        _cli.log.write('create', 'force json: ' + (forceJson ? 'true' : 'false'));
        _cli.log.write('create', JSON.stringify(forceJson));
        var tpl = templatePath;
        var text = (0, _cli.getTemplate)(tpl);
        text = _cli.Util.removeDataList(text);
        var resHook = _cli.Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text);
        filePath = resHook.filePath;
        json = resHook.json;
        text = resHook.text;

        (0, _cli.save)(filePath, req.query.selectTemplate, json, text, 'draft', null, 'draft').then(function (resSave) {
          _cli.log.write('create', 'success');
          filePath = resSave.htmlPath;
          tplUrl = _cli.FileParser.getFileDataFromUrl(filePath);
          resolve(resSave.json);
        }).catch(function (e) {
          reject();
          _cli.log.write('create', '[ ERROR ]' + e.stack);
          console.error(e.stack);
        });
      } else {
        _cli.log.write('create', '[ INFO ] file already exist, exit');
        var json = _cli.FileParser.getJson(tplUrl.json.path);
        resolve(json, tplUrl.json.path);
      }
    } else {
      _cli.log.write('create', '[ ERROR ] cleantemplatePath is not defined');
      reject();
    }
  }).catch(function (e) {
    console.error(e.stack);
    reject();
  });

  return p;
};

exports.default = create;