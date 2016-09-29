'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepend(value, array) {
	var newArray = array.slice(0);
	newArray.unshift(value);
	return newArray;
}

var abeProcess = function abeProcess(name) {
	var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	args = prepend('ABE_WEBSITE=' + _.config.root, args);
	args = prepend('ABEJS_PATH=' + __dirname + '/../../../dist', args);

	var file = __dirname + '/../../cli/process/' + name + '.js';
	try {
		var stats = _fsExtra2.default.statSync(file);
		if (stats.isFile()) {
			_child_process2.default.fork(file, args);
		}
	} catch (err) {
		try {
			file = _.Plugins.instance.getProcess(name);
			var stats = _fsExtra2.default.statSync(file);
			if (stats.isFile()) {
				_child_process2.default.fork(file, args);
			}
		} catch (err) {}
	}
};

exports.default = abeProcess;