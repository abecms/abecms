'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _dirCompare = require('dir-compare');

var _dirCompare2 = _interopRequireDefault(_dirCompare);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileParser = function () {
  function FileParser() {
    _classCallCheck(this, FileParser);
  }

  _createClass(FileParser, null, [{
    key: 'getWebsite',
    value: function getWebsite(path) {
      var beforeRoot = _.config.root.split('/');
      beforeRoot = beforeRoot.pop();
      var website = beforeRoot;
      return website.split('/')[0];
    }
  }, {
    key: 'getTemplate',
    value: function getTemplate(path) {
      var file = path.replace(_.config.root, '');
      var file = path.replace(_.config.templates.url, '');
      return file.replace(/^\//, "");
    }
  }, {
    key: 'getType',
    value: function getType(path) {
      var folders = path.replace(_.config.root, '');
      folders = folders.replace(/^\//, "");
      return folders.split('/')[0];
    }
  }, {
    key: 'read',
    value: function read(base, dirName, type, flatten) {
      var extensions = arguments.length <= 4 || arguments[4] === undefined ? /(.*?)/ : arguments[4];
      var max = arguments.length <= 5 || arguments[5] === undefined ? 99 : arguments[5];
      var current = arguments.length <= 6 || arguments[6] === undefined ? 0 : arguments[6];
      var inversePattern = arguments.length <= 7 || arguments[7] === undefined ? false : arguments[7];

      var arr = [];
      var level = _fsExtra2.default.readdirSync(dirName);
      var fileCurrentLevel = [];
      var assets = _.config.files.templates.assets;

      for (var i = 0; i < level.length; i++) {
        var path = dirName + '/' + level[i];
        var isFolder = _.folderUtils.isFolder(path);
        var match = isFolder ? true : inversePattern ? !extensions.test(level[i]) : extensions.test(level[i]);
        if ((type === 'files' || type === null) && match) {

          if (_.fileUtils.isValidFile(level[i])) {
            var extension = /(\.[\s\S]*)/.exec(level[i])[0];
            var cleanName = _.fileAttr.delete(level[i]);
            var cleanNameNoExt = _.fileUtils.removeExtension(cleanName);
            var fileData = _.fileAttr.get(level[i]);

            var date;
            if (fileData.d) {
              date = fileData.d;
            } else {
              var stat = _fsExtra2.default.statSync(path);
              date = stat.mtime;
            }
            var status = fileData.s ? dirName.replace(_.config.root, '').replace(/^\//, '').split('/')[0] : 'published';
            var cleanFilePath = _.fileUtils.cleanFilePath(path);

            var fileDate = (0, _moment2.default)(date);
            var duration = _moment2.default.duration((0, _moment2.default)(fileDate).diff(new Date())).humanize(true);

            var filePath = path.replace(_.config.root, '');
            filePath = filePath.split('/');
            filePath.shift();
            filePath = filePath.join('/');
            var item = {
              'name': level[i],
              'path': path,
              'cleanPathName': _.fileAttr.delete(path),
              'cleanPath': path.replace(base + '/', ''),
              date: date,
              cleanDate: fileDate.format("YYYY/MM/DD HH:MM:ss"),
              duration: duration,
              // status: status,
              cleanName: cleanName,
              cleanNameNoExt: cleanNameNoExt,
              cleanFilePath: cleanFilePath,
              filePath: filePath,
              'type': 'file',
              'fileType': extension
            };

            if (!flatten) item['folders'] = [];
            arr.push(item);
            // push current file name into array to check if siblings folder are assets folder
            fileCurrentLevel.push(_.fileUtils.removeExtension(level[i]) + assets);
          }
        }
        if (!fileCurrentLevel.includes(level[i]) && match) {
          if (isFolder) {
            if (!flatten) {
              var index = arr.push({ 'name': level[i], 'path': path, 'cleanPath': path.replace(base + '/', ''), 'folders': [], 'type': 'folder' }) - 1;
              if (current < max) {
                arr[index].folders = FileParser.read(base, path, type, flatten, extensions, max, current + 1, inversePattern);
              }
            } else {
              if (type === 'folders' || type === null) {
                arr.push({ 'name': level[i], 'path': path, 'cleanPath': path.replace(base + '/', ''), 'type': 'folder' });
              }
              if (current < max) {
                Array.prototype.forEach.call(FileParser.read(base, path, type, flatten, extensions, max, current + 1, inversePattern), function (files) {
                  arr.push(files);
                });
              }
            }
          }
        }
      }

      return arr;
    }
  }, {
    key: 'getFolders',
    value: function getFolders(folder, flatten, level) {
      var arr = [];
      flatten = flatten || false;
      arr = FileParser.read(_.fileUtils.cleanPath(folder), _.fileUtils.cleanPath(folder), 'folders', flatten, /(.*?)/, level);
      return arr;
    }
  }, {
    key: 'getFiles',
    value: function getFiles(folder, flatten, level) {
      var extensions = arguments.length <= 3 || arguments[3] === undefined ? /(.*?)/ : arguments[3];
      var inversePattern = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      var arr = [];
      flatten = flatten || false;
      arr = FileParser.read(_.fileUtils.cleanPath(folder), _.fileUtils.cleanPath(folder), 'files', flatten, extensions, level, 0, inversePattern);

      return arr;
    }
  }, {
    key: 'getFilesByType',
    value: function getFilesByType(path) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (!_.folderUtils.isFolder(path)) {
        _mkdirp2.default.sync(path);
      }
      var files = FileParser.getFiles(path, true, 20, new RegExp('.' + _.config.files.templates.extension));

      var result = [];

      Array.prototype.forEach.call(files, function (file) {
        var val = _.fileAttr.get(file.path).s;
        if (type === null || val === type) result.push(file);
      });
      return result;
    }
  }, {
    key: 'getAssetsFolder',
    value: function getAssetsFolder() {
      var pathAssets = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      var folder = _.fileUtils.pathWithRoot(pathAssets);
      var assetsFolders = [];
      var flatten = true;
      var site = folder;

      var templates = _.config.templates.url;
      var assets = _.config.files.templates.assets;
      var pathAssets = _path2.default.join(folder, templates);

      if (_.folderUtils.isFolder(pathAssets)) {
        var arr = FileParser.read(pathAssets, pathAssets, 'files', flatten, /(.*?)/, 99);

        // now check if file for folder exist
        Array.prototype.forEach.call(arr, function (file) {
          var folderName = _.fileUtils.removeExtension(file.path) + assets;
          if (_.folderUtils.isFolder(folderName)) assetsFolders.push(folderName);
        });
      }

      return assetsFolders;
    }
  }, {
    key: 'getAssets',
    value: function getAssets() {
      var folders = FileParser.getAssetsFolder();
      var assets = [];
      Array.prototype.forEach.call(folders, function (folder) {
        assets = assets.concat(FileParser.read(folder, folder, 'files', true, /(.*?)/, 99));
      });

      return assets;
    }
  }, {
    key: 'getProjectFiles',
    value: function getProjectFiles() {
      var site = _.folderUtils.folderInfos(_.config.root);
      var result = { 'structure': [], 'templates': [] };

      var structure = _.config.structure.url;
      var templates = _.config.templates.url;

      if (_.folderUtils.isFolder(_path2.default.join(site.path, structure))) {
        site.folders = FileParser.getFolders(_path2.default.join(site.path, structure), false);
        result.structure = site.folders;
      }
      if (_.folderUtils.isFolder(_path2.default.join(site.path, templates))) {
        result.templates = result.templates.concat(FileParser.getFiles(_path2.default.join(site.path, templates), true, 10, new RegExp('.' + _.config.files.templates.extension)));
      }

      return result;
    }
  }, {
    key: 'changePathEnv',
    value: function changePathEnv(pathEnv, change) {
      pathEnv = pathEnv.replace(_.config.root, '').replace(/^\//, '').split('/');
      pathEnv[0] = change;

      return _path2.default.join(_.config.root, pathEnv.join('/'));
    }
  }, {
    key: 'getFileDataFromUrl',
    value: function getFileDataFromUrl(url) {
      var res = {
        root: '',
        draft: {
          dir: '',
          file: '',
          path: ''
        },
        publish: {
          dir: '',
          file: '',
          link: '',
          path: '',
          json: ''
        },
        json: {
          path: '',
          file: ''
        }
      };

      var extension = _.config.files.templates.extension;
      if (typeof url !== 'undefined' && url !== null) {

        var dir = _.fileUtils.removeLast(url).replace(_.config.root, '');
        var filename = _.fileUtils.filename(url);
        var basePath = dir.replace(_.config.root, '').split('/');
        var link = url.replace(_.config.root, '');
        link = link.split('/');
        link.shift();
        link = _.fileAttr.delete('/' + _.fileUtils.cleanPath(link.join('/')));

        var draft = _.config.draft.url;
        var publish = _.config.publish.url;
        var data = _.config.data.url;

        var draftPath = FileParser.changePathEnv(_path2.default.join(_.config.root, dir), draft);

        res.root = _.config.root;

        // set dir path draft/json
        res.draft.dir = FileParser.changePathEnv(_path2.default.join(_.config.root, dir), draft);
        res.json.dir = FileParser.changePathEnv(_path2.default.join(_.config.root, dir), data);
        res.publish.dir = FileParser.changePathEnv(_path2.default.join(_.config.root, dir), publish);
        res.publish.json = res.json.dir;

        // set filename draft/json
        res.draft.file = filename;
        res.publish.file = _.fileAttr.delete(filename);
        res.publish.link = link;
        res.json.file = _.fileUtils.replaceExtension(filename, 'json');
        res.publish.json = _path2.default.join(res.json.dir, _.fileAttr.delete(res.json.file));

        // set filename draft/json
        res.draft.path = _path2.default.join(res.draft.dir, res.draft.file);
        res.publish.path = _path2.default.join(res.publish.dir, res.publish.file);
        res.json.path = _path2.default.join(res.json.dir, res.json.file);

        if (!_.fileUtils.isFile(res.json.path) && _.folderUtils.isFolder(res.json.dir)) {
          var files = _.fileAttr.filterLatestVersion(FileParser.getFiles(res.json.dir), 'draft');
          Array.prototype.forEach.call(files, function (file) {
            if (file.cleanName === res.json.file) res.json.path = file.path;
          });
        }
        // config.workflow.forEach(function (flow) {
        // 	res[flow] = {
        // 		dir: FileParser.changePathEnv(res.publish.dir, flow),
        // 		file: res.publish.file,
        // 		link: res.publish.link,
        // 		path: FileParser.changePathEnv(res.publish.path, flow),
        // 		json: res.json.path
        // 	}
        // })
        // console.log(res)
      }
      return res;
    }
  }, {
    key: 'copySiteAssets',
    value: function copySiteAssets(pathAssets) {
      var publicFolders = FileParser.getAssetsFolder(pathAssets);
      var publish = _.config.publish.url;
      var dest = _path2.default.join(_.config.root, publish);
      if (!_.folderUtils.isFolder(dest)) {
        _mkdirp2.default.sync(dest);
      }

      Array.prototype.forEach.call(publicFolders, function (publicFolder) {
        var res = _dirCompare2.default.compareSync(publicFolder, dest, { compareSize: true });

        res.diffSet.forEach(function (entry) {
          var state = {
            'equal': '==',
            'left': '->',
            'right': '<-',
            'distinct': '<>'
          }[entry.state];

          var name1 = entry.name1 ? entry.name1 : '';
          var name2 = entry.name2 ? entry.name2 : '';

          var exclude = _.config.files.exclude;
          if (!exclude.test(name1) && !exclude.test(name2) && entry.type1 !== 'directory' && entry.type2 !== 'directory') {

            if (typeof entry.path1 !== 'undefined' && entry.path1 !== null) {
              var original = entry.path1;
              var basePath = original.replace(publicFolder, '');
              var move = _path2.default.join(dest, basePath);

              if (entry.type2 === 'missing' || entry.state === 'distinct') {
                _fsExtra2.default.removeSync(move);
                var cp = _fsExtra2.default.copySync(original, move);
              }
            }
          }
        });
      });

      return publicFolders;
    }
  }, {
    key: 'getMetas',
    value: function getMetas(arr, type) {
      var res = [];
      Array.prototype.forEach.call(arr, function (file) {
        var meta = _.config.meta.name;

        var jsonPath = FileParser.getFileDataFromUrl(file.path).json.path;
        var json = FileParser.getJson(jsonPath);
        if (typeof json[meta] === 'undefined' || json[meta] === null) json[meta] = {};
        file['template'] = json[meta].template;
        if (typeof json[meta].latest !== 'undefined' && json[meta].latest !== null) {
          file['date'] = json[meta].latest.date;
        }
        if (typeof json[meta].complete === 'undefined' || json[meta].complete === null) {
          json[meta].complete = 0;
        }
        if (typeof json[meta] !== 'undefined' && json[meta] !== null) {
          file[_.config.meta.name] = json[meta];
        }
        res.push(file);
      });

      return res;
    }

    /**
     * This function makes sorting on an array of Json objects possible.
     * Pass the property to be sorted on.
     * Usage: myArray.sort(FileParser.predicatBy('date',-1));
     * @param  String prop  the json property to sort on
     * @param  integer order order ASC if 1, DESC if -1
     * @return integer the ordered value
     */

  }, {
    key: 'predicatBy',
    value: function predicatBy(prop, order) {
      if (order !== -1) {
        order = 1;
      }
      if (prop === 'date') {
        return function (a, b) {
          a = new Date(a[prop]);
          b = new Date(b[prop]);
          if (a > b) {
            return 1 * order;
          } else if (a < b) {
            return -1 * order;
          }
          return 0;
        };
      }

      return function (a, b) {
        if (a[prop] > b[prop]) {
          return 1 * order;
        } else if (a[prop] < b[prop]) {
          return -1 * order;
        }
        return 0;
      };
    }
  }, {
    key: 'getAllFilesWithKeys',
    value: function getAllFilesWithKeys(withKeys) {
      var site = _.folderUtils.folderInfos(_.config.root);

      var files = FileParser.getFiles(_path2.default.join(_.config.root, _.config.data.url), true, 99, /\.json/);
      var filesArr = [];

      var i = 0;

      files.forEach(function (file) {
        // var t = new TimeMesure('add files')
        var cleanFile = file;
        var json = FileParser.getJson(file.path);

        if (typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
          cleanFile.abe_meta = {
            date: typeof json.abe_meta.date !== 'undefined' && json.abe_meta.date !== null ? json.abe_meta.date : null,
            type: typeof json.abe_meta.type !== 'undefined' && json.abe_meta.type !== null ? json.abe_meta.type : null,
            link: typeof json.abe_meta.link !== 'undefined' && json.abe_meta.link !== null ? json.abe_meta.link : null,
            template: typeof json.abe_meta.template !== 'undefined' && json.abe_meta.template !== null ? json.abe_meta.template : null,
            status: typeof json.abe_meta.status !== 'undefined' && json.abe_meta.status !== null ? json.abe_meta.status : null,
            cleanName: typeof json.abe_meta.cleanName !== 'undefined' && json.abe_meta.cleanName !== null ? json.abe_meta.cleanName : null,
            cleanFilename: typeof json.abe_meta.cleanFilename !== 'undefined' && json.abe_meta.cleanFilename !== null ? json.abe_meta.cleanFilename : null
          };
        }
        Array.prototype.forEach.call(withKeys, function (key) {
          var keyFirst = key.split('.')[0];
          cleanFile[keyFirst] = json[keyFirst];
        });
        filesArr.push(cleanFile);
        // t.duration()
      });

      var merged = _.fileUtils.getFilesMerged(filesArr);

      _.Hooks.instance.trigger('afterGetAllFiles', merged);
      return merged;
    }

    // TODO : change the signature of this method to removeFile(file)

  }, {
    key: 'removeFile',
    value: function removeFile(file, json) {
      if (_.fileUtils.isFile(file)) {
        _fsExtra2.default.removeSync(file);
      }

      if (_.fileUtils.isFile(json)) {
        _fsExtra2.default.removeSync(json);
      }
    }
  }, {
    key: 'unpublishFile',
    value: function unpublishFile(filePath) {
      var tplUrl = FileParser.getFileDataFromUrl(_path2.default.join(_.config.publish.url, filePath));
      if (_.fileUtils.isFile(tplUrl.json.path)) {
        var json = JSON.parse(JSON.stringify(FileParser.getJson(tplUrl.json.path)));
        if (typeof json.abe_meta.publish !== 'undefined' && json.abe_meta.publish !== null) {
          delete json.abe_meta.publish;
        }

        (0, _.save)(_.fileUtils.getFilePath(json.abe_meta.link), json.abe_meta.template, json, '', 'reject', null, 'reject').then(function (resSave) {
          FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json);
          _.Manager.instance.updateList();
        });
      }
    }
  }, {
    key: 'deleteFile',
    value: function deleteFile(filePath) {
      filePath = _.Hooks.instance.trigger('beforeDeleteFile', filePath);

      var revisions = _.fileAttr.getVersions(filePath);

      Array.prototype.forEach.call(revisions, function (revision) {
        FileParser.removeFile(revision.path, revision.htmlPath);
      });

      _.Manager.instance.updateList();
    }
  }, {
    key: 'deleteFileFromName',
    value: function deleteFileFromName(filePath) {
      var pathDelete = filePath.split('/');
      var file = pathDelete.pop();
      pathDelete = pathDelete.join('/');
      try {
        var stat = _fsExtra2.default.statSync(pathDelete);
        if (stat) {
          var files = FileParser.getFiles(pathDelete, true, 10, new RegExp('.' + _.config.files.templates.extension));

          Array.prototype.forEach.call(files, function (item) {
            if (_.fileAttr.delete(item.name) === file) _fsExtra2.default.removeSync(item.path);
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: 'getReference',
    value: function getReference() {
      var ref = {};

      var refFolder = _path2.default.join(_.config.root, _.config.reference.url);
      if (_.folderUtils.isFolder(refFolder)) {
        var files = FileParser.read(_.fileUtils.cleanPath(refFolder), _.fileUtils.cleanPath(refFolder), 'files', true, /.json/);
        Array.prototype.forEach.call(files, function (file) {
          var name = file.filePath.replace(file.fileType, '');
          name = name.replace(/\//g, '.');
          var json = _fsExtra2.default.readJsonSync(file.path);

          ref[name] = json;
        });
      }

      return ref;
    }
  }, {
    key: 'getJson',
    value: function getJson(pathJson) {
      var displayError = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var json = {};
      // HOOKS beforeGetJson
      pathJson = _.Hooks.instance.trigger('beforeGetJson', pathJson);

      try {
        var stat = _fsExtra2.default.statSync(pathJson);
        if (stat) {
          var json = _fsExtra2.default.readJsonSync(pathJson);
          // var references = FileParser.getReference()
          // json[config.reference.name] = references
        }
      } catch (e) {}
      // if(displayError) console.log(clc.red(`Error loading json ${path}`),  `\n${e}`)


      // HOOKS afterGetJson
      json = _.Hooks.instance.trigger('afterGetJson', json);
      return json;
    }
  }]);

  return FileParser;
}();

exports.default = FileParser;