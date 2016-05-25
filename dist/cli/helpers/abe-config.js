'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _config = require('../config');

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var result = (0, _extend2.default)(true, _config.abeConfig, _config.abeConfigLocal);
result.root = result.root.replace(/\/$/, "");

var loadLocalConfig = function loadLocalConfig(result) {
	var website = result.root.replace(/\/$/, '');
	try {
		var stat = _fsExtra2.default.statSync(website);
		if (stat && stat.isDirectory()) {
			try {
				stat = _fsExtra2.default.statSync(website + '/abe.json');
				if (stat) {
					var json = _fsExtra2.default.readJsonSync(website + '/abe.json');
					var result = (0, _extend2.default)(true, result, json);
				}
			} catch (e) {
				_.log.error('abe-config', website + '/abe.json', '\n' + e);
				console.log(_cliColor2.default.red('Error abe-config ' + website + '/abe.json'));
			}
		}
	} catch (e) {}
};

loadLocalConfig(result);

result.exist = function (conf, json) {
	var c = conf.split('.');
	var current = json;
	if (typeof current !== 'undefined' && current !== null) {
		Array.prototype.forEach.call(c, function (c) {
			if (current !== false && typeof current[c] !== 'undefined' && current[c] !== null) {
				current = current[c];
			} else {
				current = false;
				return false;
			}
		});
		return current;
	} else {
		return false;
	}
};

result.getDefault = function (conf) {
	return result[conf];
};

result.get = function (conf, file) {
	return result.exist(conf, result);

	if (typeof file !== 'undefined' && file !== null && file !== '') {
		var website = file.replace(result.root, '');
		website = website.split('/')[0];

		var websiteConf = result.exist(conf, result.websites[website]);
		if (websiteConf !== false) {
			return websiteConf;
		}
	}

	return result.exist(conf, result);
};

result.set = function (json) {
	(0, _extend2.default)(true, result, json);
	loadLocalConfig(result);
};

result.save = function (website, json) {
	(0, _extend2.default)(true, result, json);

	var confPath = result.root.replace(/\/$/, "") + '/abe.json';
	_fsExtra2.default.writeJsonSync(confPath, json, { space: 2, encoding: 'utf-8' });
};

result.getConfigByWebsite = function () {
	var defaultConfig = (0, _extend2.default)(true, {}, result);
	var configBySite = {
		default: {}
	};

	var localConfig = (0, _extend2.default)(true, {}, defaultConfig);
	for (var item in localConfig) {
		switch (item) {
			case 'intlData':
				configBySite.default.intlData = localConfig[item];
				break;
			case 'templates':
				configBySite.default.templates = localConfig[item];
				break;
			case 'structure':
				configBySite.default.structure = localConfig[item];
				break;
			case 'data':
				configBySite.default.data = localConfig[item];
				break;
			case 'draft':
				configBySite.default.draft = localConfig[item];
				break;
			case 'publish':
				configBySite.default.publish = localConfig[item];
				break;
			case 'files':
				configBySite.default.files = {
					templates: {
						extension: localConfig[item].templates.extension
					}
				};
				break;
			case 'upload':
				configBySite.default.upload = localConfig[item];
				break;
		}
	}

	return configBySite;
};

exports.default = result;