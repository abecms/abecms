'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fullAttr = '-abe-(.+?)(?=\.';
var captureAttr = '-abe-(.+?)(?=\.';
var oneAttr = ['[\\|]?', '=(.)*?(?=[\||\\]])'];

/**
 * Class Attr
 * Work string to manage string attributes key/value
 */

var Attr = function () {

  /**
   * @param  {String} str string to work with
   * @return {void}
   */
  function Attr(str) {
    _classCallCheck(this, Attr);

    this.str = str;
    this.val = {};
    this.extract();
  }

  /**
   * @return {Object} attributs extracted from string as an object
   */


  _createClass(Attr, [{
    key: 'extract',
    value: function extract() {
      var rex = new RegExp(captureAttr + this.getExtention() + ')');
      if (rex.test(this.str)) {
        var arrAttr = this.str.match(rex)[0].replace('-abe-', '');
        this.val = { 's': arrAttr[0], 'd': (0, _.dateUnslug)(arrAttr.slice(1), this.str) };
      }
      return this.val;
    }

    /**
     * @return {String} str without an attributs
     */

  }, {
    key: 'remove',
    value: function remove() {
      return this.str.replace(new RegExp(fullAttr + this.getExtention() + ')'), '');
    }
  }, {
    key: 'getExtention',
    value: function getExtention() {
      var ext = this.str.split('.');
      return ext[ext.length - 1];
    }

    /**
     * Insert attributs to the string
     * @param  {String} string composed of a status (ex: v for validate, d for draft ...) and a date
     * @return {String} the new string with added attributs
     */

  }, {
    key: 'insert',
    value: function insert(newValues) {
      var strWithoutAttr = this.remove();
      strWithoutAttr = strWithoutAttr.replace(new RegExp('\\.' + this.getExtention()), '');
      return strWithoutAttr + '-abe-' + newValues + '.' + this.getExtention();
    }
  }]);

  return Attr;
}();

/**
 * Class FileAttr
 * Manage string with attributs encoded inside
 */


var FileAttr = function () {
  function FileAttr() {
    _classCallCheck(this, FileAttr);
  }

  _createClass(FileAttr, null, [{
    key: 'add',


    /**
     * Add attributs or modify them if they already exists
     * @param {String} str the string to modify
     * @param {Object} options object with attributs to add
     * @return {String} the string with the new attributs
     */
    value: function add(str, options) {
      var attr = new Attr(str);
      return attr.insert(options);
    }

    /**
     * Remove attributs from string
     * @param {String} str the string to modify
     * @return {String} the string modified
     */

  }, {
    key: 'delete',
    value: function _delete(str) {
      return new Attr(str).remove();
    }

    /**
     * @param  {String} str the string to get attributs from
     * @return {object|String} object (all the attributs) if the key is null, if not the value of the atrtibuts
     */

  }, {
    key: 'get',
    value: function get(str) {
      return new Attr(str).val;
    }

    /**
     * @param  {String} str the string to test attributs from
     * @return {boolean} true if string has attr
     */

  }, {
    key: 'test',
    value: function test(str) {
      var att = new Attr(str).val;
      return typeof att.s !== 'undefined' && att.s !== null;
    }
  }, {
    key: 'getFilesRevision',
    value: function getFilesRevision(urls, fileName) {
      var res = [];
      var number = 1;
      var tplUrl = _.FileParser.getFileDataFromUrl(fileName);
      fileName = fileName.split('/');
      fileName = fileName[fileName.length - 1];
      var publishDate = new Date();
      var json = null;

      if (_.fileUtils.isFile(tplUrl.publish.json)) {
        json = _.FileParser.getJson(tplUrl.publish.json);
        if (typeof json !== 'undefined' && json !== null && typeof json[_.config.meta.name] !== 'undefined' && json[_.config.meta.name] !== null) {
          publishDate = new Date(json[_.config.meta.name].latest.date);
        }
      }

      var publishVersion = false;
      urls.forEach(function (urlObj) {
        var fileData = FileAttr.get(urlObj.cleanPath);
        if (fileData.s === 'd' && FileAttr.delete(urlObj.cleanPath) == FileAttr.delete(fileName)) {
          var currentDate = new Date(urlObj.date);
          if (currentDate.getTime() > publishDate.getTime()) {
            if (!publishVersion && typeof res[res.length - 1] !== 'undefined' && res[res.length - 1] !== null) {
              res[res.length - 1].publishedDate = 'same';
            }
            publishVersion = true;
            urlObj.publishedDate = 'after';
          } else if (currentDate.getTime() === publishDate.getTime()) {
            urlObj.publishedDate = 'same';
            publishVersion = true;
          } else {
            urlObj.publishedDate = 'before';
          }
          urlObj.version = number;
          number = number + 1;

          var tplUrlObj = _.FileParser.getFileDataFromUrl(urlObj.path);
          if (_.fileUtils.isFile(tplUrlObj.publish.json)) {
            var jsonObj = _.FileParser.getJson(tplUrlObj.publish.json);
            urlObj[_.config.meta.name] = jsonObj[_.config.meta.name];
          }
          res.push(urlObj);
        }
      });
      return res;
    }
  }, {
    key: 'sortByDateDesc',
    value: function sortByDateDesc(a, b) {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      if (dateA < dateB) {
        return 1;
      } else if (dateA > dateB) {
        return -1;
      }
      return 0;
    }

    /**
     * Filter and array of file path and return the latest version of those files
     * @param  {Object} urls object with path to file, filename etc ...
     * @param  {String} type (draft|waiting|valid)
     * @return {Object} urls object filtered
     */

  }, {
    key: 'getVersions',
    value: function getVersions(docPath) {
      var files = _.Manager.instance.getList();
      var fileWithoutExtension = docPath.replace('.' + _.config.files.templates.extension, '');

      var result = [];
      Array.prototype.forEach.call(files, function (file) {
        if (file.path.indexOf(fileWithoutExtension) > -1) {
          result = file.revisions;
        }
      });
      return result;
    }

    /**
     * Filter and array of file path and return the latest version of those files
     * @param  {Object} urls object with path to file, filename etc ...
     * @param  {String} type (draft|waiting|valid)
     * @return {Object} urls object filtered
     */

  }, {
    key: 'getLatestVersion',
    value: function getLatestVersion(docPath) {
      var sameFiles = FileAttr.getVersions(docPath);
      if (sameFiles.length > 0) {
        return sameFiles[sameFiles.length - 1];
      }
      return null;
    }

    /**
     * Filter and array of file path and return the latest version of those files
     * @param  {Object} urls object with path to file, filename etc ...
     * @param  {String} type (draft|waiting|valid)
     * @return {Object} urls object filtered
     */

  }, {
    key: 'filterLatestVersion',
    value: function filterLatestVersion(urls) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      var typeStr = '';
      switch (type) {
        case 'draft':
          typeStr = 'd';break;
        default:
          typeStr = type[0];break;
      }
      return FileAttr.filter(urls, 'latest', typeStr);
    }

    /**
     * Filter and array of file 
     * @param  {[type]} urlsArr urls object with path to file, filename etc ...
     * @param  {[type]} filter filter to use
     * @param  {String} type
     * @return {Object} urls object filtered
     */

  }, {
    key: 'filter',
    value: function filter(urlsArr, _filter) {
      var type = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      var latest = [];
      var result = [];

      urlsArr.forEach(function (urlObj) {

        var realFileName = FileAttr.delete(urlObj.cleanPath);
        var cleanPath = urlObj.cleanPath;
        var currentAttrDate = FileAttr.get(urlObj.cleanPath);

        if (currentAttrDate.s === type) {
          if (typeof latest[realFileName] !== 'undefined' && latest[realFileName] !== null) {
            switch (_filter) {
              case 'latest':
                var savedAttrDate = FileAttr.get(latest[realFileName].cleanPath);
                var dateSavedUrl = new Date(savedAttrDate.length > 1 ? savedAttrDate : 0);
                var dateCurrentUrl = new Date(currentAttrDate.d.length > 1 ? currentAttrDate.d : 0);
                if (dateSavedUrl < dateCurrentUrl) latest[realFileName] = urlObj;
                break;
            }
          } else {
            latest[realFileName] = urlObj;
          }
        }
      });

      for (var prop in latest) {
        result.push(latest[prop]);
      }

      return result;
    }
  }, {
    key: 'getLatestRevision',
    value: function getLatestRevision(filePath) {
      var draft = _.config.draft.url;
      var folder = _.fileUtils.removeLast(filePath);
      var fileName = filePath.replace(folder + '/', '');
      folder = folder.replace(_.config.root, '');

      folder = _.FileParser.changePathEnv(_path2.default.join(_.config.root, folder), draft);

      var arr = _.FileParser.getFiles(folder, true, 0);
      var sameFiles = [];
      Array.prototype.forEach.call(arr, function (item) {
        if (item.cleanName === fileName) {
          sameFiles.push(item);
        }
      });

      var latest = FileAttr.filter(sameFiles, 'latest', 'd');
      if (typeof latest !== 'undefined' && latest !== null && latest.length > 0) {
        return latest[0];
      }
      return null;
    }
  }]);

  return FileAttr;
}();

exports.default = FileAttr;