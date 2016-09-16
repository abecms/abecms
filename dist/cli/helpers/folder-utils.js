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

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FolderUtils = function () {
	function FolderUtils() {
		_classCallCheck(this, FolderUtils);
	}

	_createClass(FolderUtils, null, [{
		key: 'isFolder',
		value: function isFolder(path) {
			try {
				var stat = _fsExtra2.default.statSync(path);

				if (stat && stat.isDirectory()) {
					return true;
				}
			} catch (e) {
				return false;
			}
			return false;
		}
	}, {
		key: 'createFile',
		value: function createFile(path) {
			var content = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			if (path.indexOf('.json') > -1) {
				_fsExtra2.default.writeJsonSync(path, content, { space: 2, encoding: 'utf-8' });
			}
		}
	}, {
		key: 'createFolder',
		value: function createFolder(path) {
			if (!FolderUtils.isFolder(path)) {
				_mkdirp2.default.sync(path);
			}
		}
	}, {
		key: 'getFolderPath',
		value: function getFolderPath(path) {
			var folders = path.replace(_.config.root, '');
			folders = folders.replace(/^\//, "");
			folders = folders.split('/');
			folders.shift();
			folders = folders.join('/');
			folders = _.fileUtils.removeLast(folders);
			return folders;
		}
	}, {
		key: 'folderInfos',
		value: function folderInfos(pathFolder) {
			var pathArr = pathFolder.split('/');
			var name = pathArr[pathArr.length - 1];

			var rootArr = _.config.root.split('/');
			var website = rootArr[pathArr.length - 1];
			return {
				'name': name,
				'path': pathFolder,
				'website': website,
				'cleanPath': _.fileUtils.cleanPath(pathFolder.replace(_.config.root, '')),
				'type': 'folder'
			};
		}
	}]);

	return FolderUtils;
}();

exports.default = FolderUtils;