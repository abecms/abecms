'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var duplicate = function duplicate(oldFilePath, template, path, name, req) {
  var deleteFiles = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

  var p = new Promise(function (resolve, reject) {
    _cli.Hooks.instance.trigger('beforeDuplicate', oldFilePath, template, path, name, req, deleteFiles);

    if (typeof oldFilePath !== 'undefined' && oldFilePath !== null) {
      _cli.log.write('duplicate', 'oldFilePath: ' + oldFilePath);
      var url = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.draft.url, oldFilePath);
      var revisions = [];

      if (!_cli.fileAttr.test(url)) {
        var folderFilePath = url.split('/');
        folderFilePath.pop();
        folderFilePath = _cli.fileUtils.pathWithRoot(folderFilePath.join('/'));

        var files = _cli.FileParser.getFiles(folderFilePath, true, 2);
        revisions = _cli.fileAttr.getFilesRevision(files, url);
        var latest = _cli.fileAttr.filterLatestVersion(revisions, 'draft');
        if (latest.length) {
          url = latest[0].path;
        }
      } else if (deleteFiles) {
        files = _cli.FileParser.getFiles(folderFilePath, true, 2);
        revisions = _cli.fileAttr.getFilesRevision(files, url);
      }

      _cli.log.write('duplicate', 'url with date: ' + url.replace(_cli.config.root, ''));

      var tplUrl = _cli.FileParser.getFileDataFromUrl(url);
      if (!_cli.fileUtils.isFile(tplUrl.json.path)) {
        _cli.log.write('duplicate', '[ ERROR ] no json found : ' + tplUrl.json.path.replace(_cli.config.root, ''));
      } else {
        _cli.log.write('duplicate', 'json found: ' + tplUrl.json.path.replace(_cli.config.root, ''));
      }
      var json = _cli.FileParser.getJson(tplUrl.json.path);
      delete json.abe_meta;
    }

    if (deleteFiles) {
      _cli.Hooks.instance.trigger('beforeUpdate', json, oldFilePath, template, path, name, req, deleteFiles);
      Array.prototype.forEach.call(revisions, function (revision) {
        if (typeof revision.path !== 'undefined' && revision.path !== null) {
          _cli.log.write('delete', 'file ' + revision.path.replace(_cli.config.root, ''));
          _cli.FileParser.deleteFile(revision.path);
        }
      });
    }
    _cli.Hooks.instance.trigger('afterDuplicate', json, oldFilePath, template, path, name, req, deleteFiles);

    var pCreate = (0, _cli.abeCreate)(template, path, name, req, json);
    pCreate.then(function (resSave) {
      _cli.log.write('duplicate', 'success');
      resolve(resSave);
    }, function () {
      reject();
    }).catch(function (e) {
      _cli.log.write('duplicate', '[ ERROR ]' + e);
      console.error(e);
      reject();
    });
  });

  return p;
};

exports.default = duplicate;