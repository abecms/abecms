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

var traverseFileSystem = function traverseFileSystem(currentPath, arr) {
  var res = [];
  var files = _fsExtra2.default.readdirSync(currentPath);
  for (var i in files) {
    var currentFile = currentPath + '/' + files[i];
    var stats = _fsExtra2.default.statSync(currentFile);
    if (stats.isFile()) {
      if (currentFile.indexOf(_cli.config.files.templates.extension) > -1) {
        res.push(currentFile);
      }
    } else if (stats.isDirectory()) {
      res = res.concat(traverseFileSystem(currentFile));
    }
  }
  return res;
};

var findTemplates = function findTemplates(templatesPath) {
  var p = new Promise(function (resolve, reject) {
    var templatesList = traverseFileSystem(templatesPath);
    resolve(templatesList);
  });

  return p;
};

/**
 * Get columns and where.left ids of a select statement
 *
 * select title, image from ../ where template=""
 *
 * return [title, image, template]
 * 
 * @param  {Array} templatesList ["article.html", "other.html"]
 * @return {Promise}
 */
var findRequestColumns = function findRequestColumns(templatesList) {
  var whereKeysCheck = {};
  var whereKeys = [];
  var p = new Promise(function (resolve, reject) {
    var util = new _cli.Util();
    Array.prototype.forEach.call(templatesList, function (file) {
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
      });
    });
    resolve(whereKeys);
  });

  return p;
};

var getSelectTemplateKeys = function getSelectTemplateKeys(templatesPath) {
  var p = new Promise(function (resolve, reject) {
    findTemplates(templatesPath).then(function (templatesList) {

      findRequestColumns(templatesList).then(function (whereKeys) {
        resolve(whereKeys);
      }, function () {
        console.log('findRequestColumns reject');
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