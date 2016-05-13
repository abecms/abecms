'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cli = require('../../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var result = {};

var pathToLocale = _cli.fileUtils.concatPath(__dirname, '../' + _cli.config.localeFolder, _cli.config.intlData.locales);
var files = _fsExtra2.default.readdirSync(pathToLocale);

Array.prototype.forEach.call(files, function (file) {
	var json = _fsExtra2.default.readJsonSync(pathToLocale + '/' + file);
	result = (0, _extend2.default)(true, result, json);
});

exports.default = result;