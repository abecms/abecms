'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

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

var FileUtils = function () {
	function FileUtils() {
		_classCallCheck(this, FileUtils);
	}

	/**
  * Prepend the path with the root path
  * @param  {string} path The path to be prepended
  * @return {string}      The path prepended with the root path
  */


	_createClass(FileUtils, null, [{
		key: 'pathWithRoot',
		value: function pathWithRoot(ppath) {
			if (typeof ppath === 'undefined' || ppath === null || ppath === '') ppath = '';
			return _path2.default.join(_.config.root, ppath.replace(_.config.root, '')).replace(/\/$/, "");
		}

		/**
   * [cleanPath remove the trailing slash in the path
   * @param  {string} path The path to be cleaned
   * @return {string}      The path with no trailing slash
   */

	}, {
		key: 'cleanPath',
		value: function cleanPath(cpath) {
			if (typeof cpath !== 'undefined' && cpath !== null) cpath = cpath.replace(/\/$/, "");
			return cpath;
		}

		/**
   * concatenate strings into a path. Each string being appended with a "/"
   * @param  {array} array of strings to be concatenated
   * @return {string} path as the result of concatenation
   */

	}, {
		key: 'concatPath',
		value: function concatPath() {
			var cpath = '';
			Array.prototype.forEach.call([].slice.call(arguments), function (argument) {
				if (cpath !== '') argument = argument.replace(/^\//, "");
				if (argument !== '') cpath += FileUtils.cleanPath(argument) + '/';
			});

			cpath = FileUtils.cleanPath(cpath);

			return cpath;
		}

		/**
   * Remove the last segment of the path (ie. /the/path/to => /the/path)
   * @param  {string} path the path
   * @return {string}      The path with the last segment removed
   */

	}, {
		key: 'removeLast',
		value: function removeLast(pathRemove) {

			return pathRemove.substring(0, FileUtils.cleanPath(pathRemove).lastIndexOf('/'));
		}

		/**
   * Replace the extension in the path (ie. /the/path/to/file.txt => /the/path/to/file.json)
   * @param  {string} path The path
   * @param  {string} ext  The extension to put as a replacement
   * @return {string}      The path with the new extension
   */

	}, {
		key: 'replaceExtension',
		value: function replaceExtension(path, ext) {

			return path.substring(0, path.lastIndexOf('.')) + '.' + ext;
		}

		/**
   * Remove the extension from the path if any
   * @param  {string} path The path
   * @return {string}      The path without extension
   */

	}, {
		key: 'removeExtension',
		value: function removeExtension(path) {
			if (path.lastIndexOf('.') > -1) {
				return path.substring(0, path.lastIndexOf('.'));
			}
			return path;
		}

		/**
   * Extract the filename from the path (ie. /the/path/to/file.json => file.json)
   * @param  {string} path The path
   * @return {string}      The filename extracted from the path
   */

	}, {
		key: 'filename',
		value: function filename(path) {

			return FileUtils.cleanPath(path).substring(FileUtils.cleanPath(path).lastIndexOf('/') + 1);
		}

		/**
   * Check if the path given coreespond to an existing file
   * @param  {string}  path The path
   * @return {Boolean}      Does the file exist
   */

	}, {
		key: 'isFile',
		value: function isFile(path) {
			try {
				var stat = _fsExtra2.default.statSync(path);

				return true;
			} catch (e) {

				return false;
			}

			return false;
		}

		/**
   * Create the directory if it doesn't exist and create the json file
   * @param  {string} path The path
   * @param  {string} json The Json data
   */

	}, {
		key: 'writeJson',
		value: function writeJson(path, json) {
			(0, _mkdirp2.default)(FileUtils.removeLast(path));
			_fsExtra2.default.writeJsonSync(path, json, { space: 2, encoding: 'utf-8' });
		}
	}, {
		key: 'removeFile',
		value: function removeFile(file) {
			_fsExtra2.default.removeSync(file);
		}

		/**
   * Check if the string given has an extension
   * @param  {string}  fileName the filename to check
   * @return {Boolean}          Wether the filename has an extension or not
   */

	}, {
		key: 'isValidFile',
		value: function isValidFile(fileName) {
			var dotPosition = fileName.indexOf('.');
			if (dotPosition > 0) return true;

			return false;
		}

		/* TODO: put this method in the right helper */

	}, {
		key: 'cleanTplName',
		value: function cleanTplName(pathClean) {
			var cleanTplName = _.fileAttr.delete(pathClean);
			cleanTplName = cleanTplName.replace(_.config.root, '');
			cleanTplName = cleanTplName.split('/');
			cleanTplName.shift();
			return cleanTplName.join('/');
		}

		/* TODO: Remove this method and replace it with the previous one */

	}, {
		key: 'cleanFilePath',
		value: function cleanFilePath(pathClean) {
			var cleanFilePath = _.fileAttr.delete(pathClean);
			cleanFilePath = cleanFilePath.replace(_.config.root, '');
			cleanFilePath = cleanFilePath.split('/');
			cleanFilePath.shift();
			return cleanFilePath.join('/');
		}

		/* TODO: put this method in the right helper */

	}, {
		key: 'getFilePath',
		value: function getFilePath(pathFile) {
			var res = null;
			if (typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
				res = pathFile.replace(_.config.root);
				res = _path2.default.join(_.config.root, _.config.draft.url, res);
			}
			return res;
		}

		/* TODO: refactor this method as Facade method to a method adding a fragment in a path */

	}, {
		key: 'getTemplatePath',
		value: function getTemplatePath(pathTemplate) {
			if (pathTemplate.indexOf('.') === -1) {
				// no extension add one
				pathTemplate = pathTemplate + '.' + _.config.files.templates.extension;
			}

			var res = null;
			if (typeof pathTemplate !== 'undefined' && pathTemplate !== null && pathTemplate !== '') {
				res = pathTemplate.replace(_.config.root);
				res = _path2.default.join(_.config.root, _.config.templates.url, res);
			}
			return res;
		}

		/**
   * This method checks that the path leads to a file and return the content as UTF-8 content
   * @param  {string} path The path
   * @return {string}      The content of the UTF-8 file
   */

	}, {
		key: 'getFileContent',
		value: function getFileContent(path) {
			var res = null;
			if (typeof path !== 'undefined' && path !== null && path !== '') {
				if (FileUtils.isFile(path)) {
					res = _fsExtra2.default.readFileSync(path, 'utf8');
				}
			}
			return res;
		}

		/* TODO: put this method in its right helper */

	}, {
		key: 'deleteOlderRevisionByType',
		value: function deleteOlderRevisionByType(fileName, type) {
			var folder = fileName.split('/');
			var file = folder.pop();
			var extension = file.replace(/.*?\./, '');
			folder = folder.join('/');
			var stat = _fsExtra2.default.statSync(folder);
			if (stat) {
				var files = _.FileParser.getFiles(folder, true, 1, new RegExp("\\." + extension));
				files.forEach(function (fileItem) {
					var fname = _.fileAttr.delete(fileItem.cleanPath);
					var ftype = _.fileAttr.get(fileItem.cleanPath).s;
					if (fname === file && ftype === type) {
						var fileDraft = fileItem.path.replace(/-abe-./, '-abe-d');
						_.FileParser.removeFile(fileItem.path, _.FileParser.changePathEnv(fileItem.path, _.config.data.url).replace(new RegExp("\\." + extension), '.json'));
						_.FileParser.removeFile(fileDraft, _.FileParser.changePathEnv(fileDraft, _.config.data.url).replace(new RegExp("\\." + extension), '.json'));
					}
				});
			}
		}

		/* TODO: put this method in its right helper */

	}, {
		key: 'getFilesMerged',
		value: function getFilesMerged(files) {
			var merged = {};
			var arMerged = [];

			Array.prototype.forEach.call(files, function (file) {
				var cleanFilePath = file.cleanFilePath;

				var fileStatusIsPublish = _.fileAttr.get(file.cleanPath);
				if (typeof fileStatusIsPublish.s !== 'undefined' && fileStatusIsPublish.s !== null) {
					file.abe_meta.status = 'draft';
				}

				file.html = _path2.default.join('/', file.filePath.replace(/\.json/, '.' + _.config.files.templates.extension));
				if (file.abe_meta.status === 'publish') {
					file.htmlPath = _path2.default.join(_.config.root, _.config.publish.url, _path2.default.join('/', file.filePath.replace(/\.json/, '.' + _.config.files.templates.extension)));
				} else {
					file.htmlPath = _path2.default.join(_.config.root, _.config.draft.url, _path2.default.join('/', file.filePath.replace(/\.json/, '.' + _.config.files.templates.extension)));
				}

				if (typeof merged[cleanFilePath] === 'undefined' || merged[cleanFilePath] === null) {
					merged[cleanFilePath] = {
						name: _.fileAttr.delete(file.name),
						path: _.fileAttr.delete(file.path),
						html: _.fileAttr.delete(_path2.default.join('/', file.filePath.replace(/\.json/, '.' + _.config.files.templates.extension))),
						htmlPath: _path2.default.join(_.config.root, _.config.publish.url, _path2.default.join('/', _.fileAttr.delete(file.filePath.replace(/\.json/, '.' + _.config.files.templates.extension)))),
						cleanPathName: file.cleanPathName,
						cleanPath: file.cleanPath,
						cleanName: file.cleanName,
						cleanNameNoExt: file.cleanNameNoExt,
						cleanFilePath: file.cleanFilePath,
						filePath: _.fileAttr.delete(file.filePath),
						revisions: []
					};
				}
				merged[cleanFilePath].revisions.push(JSON.parse(JSON.stringify(file)));
			});

			// return merged
			Array.prototype.forEach.call(Object.keys(merged), function (key) {
				var revisions = merged[key].revisions;
				revisions.sort(_.FileParser.predicatBy('date', 1));

				Array.prototype.forEach.call(revisions, function (revision) {

					var status = revision.abe_meta.status;

					if (status === 'publish') {
						merged[key][status] = revision;
					} else {
						merged[key][status] = {};
					}
					merged[key][status].path = revision.path;
					merged[key][status].html = revision.html;
					merged[key][status].htmlPath = revision.htmlPath;
					merged[key][status].date = new Date(revision.date);
					merged[key][status].link = revision.abe_meta.link;
				});

				merged[key].revisions = revisions;

				merged[key].date = revisions[0].date;
				merged[key].cleanDate = revisions[0].cleanDate;
				merged[key].duration = revisions[0].duration;
				merged[key].abe_meta = revisions[0].abe_meta;

				arMerged.push(merged[key]);
			});

			return arMerged;
		}
	}]);

	return FileUtils;
}();

exports.default = FileUtils;