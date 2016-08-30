"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = truncate;

var _handlebars = require("handlebars");

var _handlebars2 = _interopRequireDefault(_handlebars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function truncate(str, len) {
  if (str && str.length > len) {
    new_str = new _handlebars2.default.SafeString(str);
    var new_str = str + " ";
    new_str = str.substr(0, len);
    new_str = str.substr(0, new_str.lastIndexOf(" "));
    new_str = new_str.length > 0 ? new_str : str.substr(0, len);

    return new_str + '...';
  }

  return new _handlebars2.default.SafeString(str);
}