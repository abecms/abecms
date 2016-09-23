'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var duplicate = function duplicate(oldFilePath, template, newPath, name, req) {
  var isUpdate = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

  var p = new Promise(function (resolve, reject) {
    _cli.Hooks.instance.trigger('beforeDuplicate', oldFilePath, template, newPath, name, req, isUpdate);

    var json = {};
    var revisions = [];
    if (typeof oldFilePath !== 'undefined' && oldFilePath !== null) {
      var files = _cli.Manager.instance.getList();
      var fileWithoutExtension = oldFilePath.replace('.' + _cli.config.files.templates.extension, '');

      var doc = null;
      Array.prototype.forEach.call(files, function (file) {
        if (file.path.indexOf(fileWithoutExtension) > -1) {
          doc = file;
        }
      });

      if (typeof doc.revisions !== 'undefined' && doc.revisions !== null) {
        revisions = doc.revisions;

        if (typeof revisions !== 'undefined' && revisions !== null && typeof revisions[0] !== 'undefined' && revisions[0] !== null) {
          json = _cli.FileParser.getJson(revisions[0].path);
        }
      }

      delete json.abe_meta;
    }

    if (isUpdate) {
      _cli.Hooks.instance.trigger('beforeUpdate', json, oldFilePath, template, newPath, name, req, isUpdate);
      _cli.FileParser.deleteFile(oldFilePath);
    }
    _cli.Hooks.instance.trigger('afterDuplicate', json, oldFilePath, template, newPath, name, req, isUpdate);

    var pCreate = (0, _cli.abeCreate)(template, newPath, name, req, json, isUpdate ? false : true);
    pCreate.then(function (resSave) {
      resolve(resSave);
    }, function () {
      reject();
    }).catch(function (e) {
      console.error('[ERROR] abe-duplicate.js', e);
      reject();
    });
  });

  return p;
};

exports.default = duplicate;