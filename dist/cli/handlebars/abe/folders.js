'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = folders;

var _recursiveFolder = require('./recursiveFolder');

var _recursiveFolder2 = _interopRequireDefault(_recursiveFolder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function folders(obj, index, link) {
	var res;
	if (typeof link !== 'undefined' && link !== null && link !== 'null') {
		var links = link.replace(/^\//, '').split('/');
		links.pop();
		res = (0, _recursiveFolder2.default)(obj, 1, '', links);
	} else {
		res = (0, _recursiveFolder2.default)(obj, 1);
	}
	return res;
}