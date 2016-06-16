'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);

  if (typeof req.query.oldFilePath !== 'undefined' && req.query.oldFilePath !== null) {
    _cli.log.write('duplicate', '********************************************');
    _cli.log.write('duplicate', 'oldFilePath: ' + req.query.oldFilePath);
    var url = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.draft.url, req.query.oldFilePath);

    if (!_cli.fileAttr.test(url)) {
      var folderFilePath = url.split('/');
      folderFilePath.pop();
      folderFilePath = _cli.fileUtils.pathWithRoot(folderFilePath.join('/'));
      var files = _cli.FileParser.getFiles(folderFilePath, true, 2);
      var latest = _cli.fileAttr.filterLatestVersion(_cli.fileAttr.getFilesRevision(files, url), 'draft');
      if (latest.length) {
        url = latest[0].path;
      }
    }
    _cli.log.write('duplicate', 'url with date: ' + url);

    var tplUrl = _cli.FileParser.getFileDataFromUrl(url);
    _cli.log.write('duplicate', 'json: ' + tplUrl.json.path);
    var json = _cli.FileParser.getJson(tplUrl.json.path);
    delete json.abe_meta;
  }

  _cli.log.write('duplicate', 'selectTemplate: ' + req.query.selectTemplate);
  _cli.log.write('duplicate', 'filePath: ' + req.query.filePath);
  _cli.log.write('duplicate', 'tplName: ' + req.query.tplName);
  var p = (0, _cli.abeCreate)(req.query.selectTemplate, req.query.filePath, req.query.tplName, req, json);

  p.then(function (resSave) {
    _cli.log.write('duplicate', 'success');
    var result = {
      success: 1,
      json: resSave
    };
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  }, function () {
    var result = {
      success: 0
    };
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
};

exports.default = route;