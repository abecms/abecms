'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FolderSelect = function () {
  function FolderSelect() {
    _classCallCheck(this, FolderSelect);

    this._bindEvents();
  }

  _createClass(FolderSelect, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      // bind select change event
      this._formCreate = document.querySelector('.form-create');

      this._select = document.querySelector('[data-type-template-abe]');
      if (typeof this._select !== 'undefined' && this._select !== null) {
        this._handleChangeSelects = this._changeSelects.bind(this);
        this._select.addEventListener('change', this._handleChangeSelects);
      }
    }

    /**
     * bind event for select page create
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_changeSelects',
    value: function _changeSelects(e) {
      var templateName = this._select.value.replace(/\.[^/.]+$/, '');
      console.log('_changeSelects', templateName);
      this._formCreate.setAttribute('action', CONFIG.URL + templateName);
    }
  }]);

  return FolderSelect;
}();

exports.default = FolderSelect;