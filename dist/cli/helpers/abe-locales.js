'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Locales = function () {
		function Locales(enforcer) {
				_classCallCheck(this, Locales);

				if (enforcer != singletonEnforcer) throw "Cannot construct Json singleton";

				this.i18n = this._getFiles();
		}

		_createClass(Locales, [{
				key: '_reloadLocales',
				value: function _reloadLocales() {
						this.i18n = this._getFiles();
				}
		}, {
				key: '_getFiles',
				value: function _getFiles() {
						var loc = {};
						var website = _.config.root;

						try {
								var localesFolder = _.fileUtils.concatPath(website, 'locales');
								var stat = _fsExtra2.default.statSync(localesFolder);
								if (stat && stat.isDirectory()) {
										var files = _.FileParser.read(_.fileUtils.cleanPath(localesFolder), _.fileUtils.cleanPath(localesFolder), 'files', true, /\.json/, 0);
										Array.prototype.forEach.call(files, function (file) {
												var json = _fsExtra2.default.readJsonSync(file.path);
												loc[file.name.replace(/\.json/, '')] = json;
										});
								}
						} catch (e) {}

						return loc;
				}
		}], [{
				key: 'instance',
				get: function get() {
						if (!this[singleton]) {
								this[singleton] = new Locales(singletonEnforcer);
						}
						return this[singleton];
				}
		}]);

		return Locales;
}();

exports.default = Locales;