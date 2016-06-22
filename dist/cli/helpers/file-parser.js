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

			var website = _.config.root.split('/');
			website = website[website.length - 1];
			var arr = [];
			var level = _fsExtra2.default.readdirSync(dirName);
			var fileCurrentLevel = [];
			var assets = _.config.files.templates.assets;

			// read file first
			for (var i = 0; i < level.length; i++) {
				var path = dirName + '/' + level[i];
				var match = isFolder ? true : extensions.test(level[i]);
				if ((type === 'files' || type === null) && match) {
					if (_.fileUtils.isValidFile(level[i])) {
						var extension = /(\.[\s\S]*)/.exec(level[i])[0];
						var cleanName = _.fileAttr.delete(level[i]);
						var cleanNameNoExt = _.fileUtils.removeExtension(cleanName);
						var fileData = _.fileAttr.get(level[i]);
						var date = fileData.d ? fileData.d : '0000-00-00T00:00:00.000Z';
						var status = fileData.s ? dirName.replace(_.config.root, '').replace(/^\//, '').split('/')[0] : 'published';
						var cleanFilePath = _.fileUtils.cleanFilePath(path);

						var fileDate = fileDate = (0, _moment2.default)(date);
						var duration = _moment2.default.duration((0, _moment2.default)(fileDate).diff(new Date())).humanize(true);

						var filePath = path.replace(_.config.root, '');
						filePath = filePath.split('/');
						filePath.shift();
						filePath = filePath.join('/');
						var item = {
							'name': level[i],
							'path': path,
							'website': website,
							'cleanPathName': _.fileAttr.delete(path),
							'cleanPath': path.replace(base + '/', ''),
							date: date,
							cleanDate: fileDate.format("YYYY/MM/DD HH:MM:ss"),
							duration: duration,
							status: status,
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
			}

			// read folder now
			for (i = 0; i < level.length; i++) {
				var path = dirName + '/' + level[i];
				var isFolder = _.folderUtils.isFolder(path);
				var match = isFolder ? true : extensions.test(level[i]);

				if (!fileCurrentLevel.includes(level[i]) && match) {
					if (isFolder) {
						if (!flatten) {
							var index = arr.push({ 'name': level[i], 'path': path, 'website': website, 'cleanPath': path.replace(base + '/', ''), 'folders': [], 'type': 'folder' }) - 1;
							if (current < max) {
								arr[index].folders = FileParser.read(base, path, type, flatten, extensions, max, current++);
							}
						} else {
							if (type === 'folders' || type === null) {
								arr.push({ 'name': level[i], 'path': path, 'website': website, 'cleanPath': path.replace(base + '/', ''), 'type': 'folder' });
							}
							if (current < max) {
								Array.prototype.forEach.call(FileParser.read(base, path, type, flatten, extensions, max, current++), function (files) {
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

			var arr = [];
			flatten = flatten || false;
			arr = FileParser.read(_.fileUtils.cleanPath(folder), _.fileUtils.cleanPath(folder), 'files', flatten, extensions, level);
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
			var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

			var folder = _.fileUtils.pathWithRoot(path);
			var assetsFolders = [];
			var flatten = true;
			var site = folder;

			var templates = _.config.templates.url;
			var assets = _.config.files.templates.assets;
			var path = _.fileUtils.concatPath(folder, templates);

			if (_.folderUtils.isFolder(path)) {
				var arr = FileParser.read(path, path, 'files', flatten, /(.*?)/, 99);

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
		key: 'getProjetFiles',
		value: function getProjetFiles() {
			var site = _.folderUtils.folderInfos(_.config.root);
			var result = { 'structure': [], 'templates': [] };

			var structure = _.config.structure.url;
			var templates = _.config.templates.url;

			if (_.folderUtils.isFolder(_.fileUtils.concatPath(site.path, structure)) && _.folderUtils.isFolder(_.fileUtils.concatPath(site.path, templates))) {
				site.folders = FileParser.getFolders(_.fileUtils.concatPath(site.path, structure), false);
				result.structure = site.folders;
				result.templates = result.templates.concat(FileParser.getFiles(_.fileUtils.concatPath(site.path, templates), true, 10, new RegExp('.' + _.config.files.templates.extension)));
			}

			return result;
		}
	}, {
		key: 'changePathEnv',
		value: function changePathEnv(path, change) {
			path = path.replace(_.config.root, '').replace(/^\//, '').split('/');
			path[0] = change;

			return _.fileUtils.concatPath(_.config.root, path.join('/'));
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
			if (typeof url !== 'undefined' && url !== null && url.indexOf('.' + extension) > -1) {

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

				var draftPath = FileParser.changePathEnv(_.fileUtils.concatPath(_.config.root, dir), draft);

				res.root = _.config.root;

				// set dir path draft/json
				res.draft.dir = FileParser.changePathEnv(_.fileUtils.concatPath(_.config.root, dir), draft);
				res.json.dir = FileParser.changePathEnv(_.fileUtils.concatPath(_.config.root, dir), data);
				res.publish.dir = FileParser.changePathEnv(_.fileUtils.concatPath(_.config.root, dir), publish);
				res.publish.json = res.json.dir;

				// set filename draft/json
				res.draft.file = filename;
				res.publish.file = _.fileAttr.delete(filename);
				res.publish.link = link;
				res.json.file = _.fileUtils.replaceExtension(filename, 'json');
				res.publish.json = _.fileUtils.concatPath(res.json.dir, _.fileAttr.delete(res.json.file));

				// set filename draft/json
				res.draft.path = _.fileUtils.concatPath(res.draft.dir, res.draft.file);
				res.publish.path = _.fileUtils.concatPath(res.publish.dir, res.publish.file);
				res.json.path = _.fileUtils.concatPath(res.json.dir, res.json.file);

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
		value: function copySiteAssets(path) {
			var publicFolders = FileParser.getAssetsFolder(path);
			var publish = _.config.publish.url;
			var dest = _.fileUtils.concatPath(_.config.root, publish);
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
							var move = _.fileUtils.concatPath(dest, basePath);

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
	}, {
		key: 'getAllFiles',
		value: function getAllFiles() {
			var site = _.folderUtils.folderInfos(_.config.root);
			var allDraft = [];
			var allPublished = [];

			var draft = _.config.draft.url;
			var publish = _.config.publish.url;

			var drafted = FileParser.getFilesByType(_.fileUtils.concatPath(site.path, draft), 'd');
			var published = FileParser.getFilesByType(_.fileUtils.concatPath(site.path, publish));

			drafted = _.Hooks.instance.trigger('beforeGetAllFilesDraft', drafted);
			published = _.Hooks.instance.trigger('beforeGetAllFilesPublished', published);

			drafted = FileParser.getMetas(drafted, 'draft');
			published = FileParser.getMetas(published, 'draft');

			published.forEach(function (pub) {

				var json = FileParser.getJson(FileParser.changePathEnv(pub.path, _.config.data.url).replace(new RegExp("\\." + _.config.files.templates.extension), '.json'));
				if (typeof json[_.config.meta.name][_.config.draft.url] !== 'undefined' && json[_.config.meta.name][_.config.draft.url] !== null) {
					pub.filePath = json[_.config.meta.name][_.config.draft.url].latest.abeUrl;
				}
			});
			var merged = _.fileUtils.mergeFiles(drafted, published);

			site.files = _.Hooks.instance.trigger('afterGetAllFiles', merged);

			return [site];
		}
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
			var tplUrl = FileParser.getFileDataFromUrl(_.fileUtils.concatPath(_.config.publish.url, filePath));

			FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json);
		}
	}, {
		key: 'deleteFile',
		value: function deleteFile(filePath) {
			var tplUrl = FileParser.getFileDataFromUrl(_.fileUtils.concatPath(_.config.draft.url, filePath));
			var files = FileParser.getFiles(tplUrl.draft.dir, true, 1, new RegExp("\\." + _.config.files.templates.extension));
			var revisions = _.fileAttr.getFilesRevision(files, tplUrl.publish.file);

			Array.prototype.forEach.call(revisions, function (revision) {
				var revisionUrl = FileParser.getFileDataFromUrl(revision.path);
				FileParser.removeFile(revision.path, revisionUrl.json.path);
			});

			FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json);
		}
	}, {
		key: 'deleteFileFromName',
		value: function deleteFileFromName(filePath) {
			var path = filePath.split('/');
			var file = path.pop();
			path = path.join('/');
			try {
				var stat = _fsExtra2.default.statSync(path);
				if (stat) {
					var files = FileParser.getFiles(path, true, 10, new RegExp('.' + _.config.files.templates.extension));

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

			var refFolder = _.fileUtils.concatPath(_.config.root, _.config.reference.url);
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
		value: function getJson(path) {
			var displayError = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			var json = {};
			// HOOKS beforeGetJson
			path = _.Hooks.instance.trigger('beforeGetJson', path);

			try {
				var stat = _fsExtra2.default.statSync(path);
				if (stat) {
					var json = _fsExtra2.default.readJsonSync(path);
					// var references = FileParser.getReference()
					// json[config.reference.name] = references
				}
			} catch (e) {
				if (displayError) console.log(_cliColor2.default.red('Error loading json ' + path), '\n' + e);
			}

			// HOOKS afterGetJson
			json = _.Hooks.instance.trigger('afterGetJson', json);
			return json;
		}
	}]);

	return FileParser;
}();

exports.default = FileParser;