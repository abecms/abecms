'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = attrAbe;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _abeEngine = require('../abe/abeEngine');

var _abeEngine2 = _interopRequireDefault(_abeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Print properties inside html tag
 * @param  {String} attr exemple: atl, title, ...
 * @param  {[type]} value value of the property
 * @return {String} the value to print inside the attribut
 */
function attrAbe(attr, value) {
  var content = _abeEngine2.default._content;
  return new _handlebars2.default.SafeString(value);
}