'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compileAbe;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _abeEngine = require('./abeEngine');

var _abeEngine2 = _interopRequireDefault(_abeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Abe handlebar helper, that retrieve text to add to handlebars templating engine
 * @return {String} the string to replace {{ handlebars_key }}
 */
function compileAbe() {
  var content = _abeEngine2.default.instance.content;
  if (typeof arguments[0].hash['key'] === 'undefined' || arguments[0].hash['key'] === null) return '';
  if (arguments[0].hash['key'].indexOf('}-') > 0) {
    var key = arguments[0].hash['key'].split('-');
    key = key[key.length - 1];
    var hash = arguments[0].hash;
    hash.key = hash.key.replace(/\{\{@index\}\}/, '[{{@index}}]');
    return new _handlebars2.default.SafeString(content ? content[hash['dictionnary']][arguments[0].data.index][key] : hash.key);
  }

  var key = arguments[0].hash['key'].replace('.', '-');

  var hash = arguments[0].hash;
  var value = content ? content[hash.key.replace('.', '-')] : hash.key;
  if (typeof value === 'undefined' || value === null) {
    value = '';
  }
  return new _handlebars2.default.SafeString(value);
}