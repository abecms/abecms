'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _prettyjson = require('prettyjson');

var _prettyjson2 = _interopRequireDefault(_prettyjson);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logs = function () {
	function Logs() {
		_classCallCheck(this, Logs);
	}

	_createClass(Logs, null, [{
		key: 'cleanPath',
		value: function cleanPath(pathClean) {
			if (typeof pathClean !== 'undefined' && pathClean !== null) {
				// console.log('cleanPath', path)
				pathClean = pathClean.replace(/\/$/, "");
			}
			return pathClean;
		}
	}, {
		key: 'removeLast',
		value: function removeLast(pathRemove) {
			return pathRemove.substring(0, Logs.cleanPath(pathRemove).lastIndexOf('/'));
		}
	}, {
		key: 'table',
		value: function table(arr) {
			var vertical = {};

			// instantiate
			var tab = new _cliTable2.default();

			var i = '0';
			Array.prototype.forEach.call(arr, function (value) {
				var obj = {};
				obj['item-' + i++] = value;
				tab.push(obj);
			});

			return tab.toString();
		}
	}, {
		key: 'json',
		value: function json(obj) {
			return _prettyjson2.default.render(obj);
		}
	}, {
		key: 'text',
		value: function text() {
			var res = '';

			if (arguments.length > 0) {
				var args = [].slice.call(arguments);
				args.shift();

				Array.prototype.forEach.call(args, function (arg) {

					if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && Object.prototype.toString.call(args) === '[object Array]') {
						res += JSON.stringify(arg, null, 2) + "\n";
					} else if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && Object.prototype.toString.call(args) === '[object Object]') {
						res += JSON.stringify(arg, null, 2) + "\n";
					} else {
						res += arg + "\n";
					}
				});

				return res;
			}
		}
	}, {
		key: 'getType',
		value: function getType() {
			var res = '';

			if (arguments.length > 0) {
				var args = [].slice.call(arguments);
				return args[0];
			}
			return 'default';
		}
	}, {
		key: 'error',
		value: function error() {
			var type = Logs.getType.apply(this, arguments);
			var msg = '[ ERROR ' + type + ' ]\n' + Logs.text.apply(this, arguments);
			console.log(_cliColor2.default.red(msg));
			var pathError = _path2.default.join(_.config.root, '/logs/ERROR-' + Logs.getType.apply(this, arguments) + '.log');
			Logs.writeFile(pathError, msg, 'a+');
		}
	}, {
		key: 'duration',
		value: function duration(str, time) {
			if (typeof _.config.logs !== 'undefined' && _.config.logs !== null && _.config.logs === true) {
				var pathDuration = _path2.default.join(_.config.root, '/logs/duration.log');
				var durationColor = '#B2FF59';
				if (time > 5) {
					durationColor = '#ff003b';
				} else if (time > 1) {
					durationColor = '#ffbc00';
				}
				Logs.writeFile(pathDuration, str + ' in <span style="color: ' + durationColor + ';">' + time + "</span>\n", 'a+');
			}
		}
	}, {
		key: 'write',
		value: function write() {
			if (typeof _.config.logs !== 'undefined' && _.config.logs !== null && _.config.logs === true) {
				var pathWrite = _path2.default.join(_.config.root, '/logs/' + Logs.getType.apply(this, arguments) + '.log');
				Logs.writeFile(pathWrite, Logs.text.apply(this, arguments), 'a+');
			}
		}
	}, {
		key: 'delAndWrite',
		value: function delAndWrite() {
			if (typeof _.config.logs !== 'undefined' && _.config.logs !== null && _.config.logs === true) {
				var pathWrite = _path2.default.join(_.config.root, '/logs/' + Logs.getType.apply(this, arguments) + '.log');
				Logs.writeFile(pathWrite, Logs.text.apply(this, arguments), 'w');
			}
		}
	}, {
		key: 'writeFile',
		value: function writeFile(file, data, flag) {
			if (typeof _.config.logs !== 'undefined' && _.config.logs !== null && _.config.logs === true) {
				data = new Date().toString() + ' --- ' + data;
				_mkdirp2.default.sync(Logs.removeLast(file));
				_fs2.default.writeFileSync(file, data, { encoding: 'utf8', flag: flag });
			}
		}
	}]);

	return Logs;
}();

exports.default = Logs;