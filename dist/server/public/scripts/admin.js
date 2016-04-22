'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _FormCreate = require('./modules/FormCreate');

var _FormCreate2 = _interopRequireDefault(_FormCreate);

var _FormList = require('./modules/FormList');

var _FormList2 = _interopRequireDefault(_FormList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Admin = function () {
  function Admin() {
    _classCallCheck(this, Admin);

    this._page = document.querySelector('body').getAttribute('data-page');
    this._formCreate = document.querySelector('.form-create');

    this._bindEvents();
  }

  /**
   * _bindEvents for admin pages
   * @return {null}
   */


  _createClass(Admin, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      if (typeof this._formCreate !== 'undefined' && this._formCreate !== null) {
        new _FormCreate2.default();
      } else if (this._page === 'list') {
        new _FormList2.default();
      }
    }
  }]);

  return Admin;
}();

var admin = new Admin();