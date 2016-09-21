'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _child_process = require('child_process');

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var findTemplates = function findTemplates(templatesPath) {
  var p = new Promise(function (resolve, reject) {
    (0, _child_process.execFile)('find', [templatesPath], function (err, stdout, stderr) {
      if (err) reject(err);

      var file_list = stdout.split('\n');
      var file_list_with_extention = [];
      Array.prototype.forEach.call(file_list, function (file) {
        if (file.indexOf(_cli.config.files.templates.extension) > -1) {
          file_list_with_extention.push(file);
        }
      });

      resolve(file_list_with_extention);
    });
  });

  return p;
};

var findRequestKeys = function findRequestKeys(file_list_with_extention) {
  var whereKeysCheck = {};
  var whereKeys = [];
  var p = new Promise(function (resolve, reject) {
    var util = new _cli.Util();
    Array.prototype.forEach.call(file_list_with_extention, function (file) {
      var template = _fsExtra2.default.readFileSync(file, 'utf8');
      var matches = util.dataRequest(template);

      Array.prototype.forEach.call(matches, function (match) {
        var obj = _cli.Util.getAllAttributes(match[0], {});
        obj = _cli.Util.sanitizeSourceAttribute(obj, {});

        var type = _cli.Sql.getSourceType(obj.sourceString);

        switch (type) {
          case 'request':
            var request = _cli.Sql.handleSqlRequest(obj.sourceString, {});
            Array.prototype.forEach.call(request.columns, function (column) {
              if (typeof whereKeysCheck[column] === 'undefined' || whereKeysCheck[column] === null) {
                whereKeysCheck[column] = true;
                whereKeys.push(column);
              }
            });
            Array.prototype.forEach.call(request.where, function (where) {
              if (typeof whereKeysCheck[where.left] === 'undefined' || whereKeysCheck[where.left] === null) {
                whereKeysCheck[where.left] = true;
                whereKeys.push(where.left);
              }
            });
        }
        resolve(whereKeys);
      });
    });
  });

  return p;
};

var getSelectTemplateKeys = function getSelectTemplateKeys(templatesPath) {
  var p = new Promise(function (resolve, reject) {
    findTemplates(templatesPath).then(function (file_list_with_extention) {

      findRequestKeys(file_list_with_extention).then(function (whereKeys) {

        resolve(whereKeys);
      }, function () {
        console.log('findRequestKeys reject');
        reject();
      }).catch(function (e) {
        console.error('getSelectTemplateKeys', e);
        reject();
      });
    }, function () {
      console.log('findTemplates reject');
      reject();
    }).catch(function (e) {
      console.error('getSelectTemplateKeys', e);
      reject();
    });
  });

  return p;
};

exports.default = getSelectTemplateKeys;