'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormList = function () {
  function FormList() {
    var _this = this;

    _classCallCheck(this, FormList);

    // bind button event click
    this._btnValidates = [].slice.call(document.querySelectorAll('[data-validate-content]'));
    this._handleBtnValidatesClick = this._btnValidatesClick.bind(this);

    this._btnValidates.forEach(function (input) {
      input.addEventListener('click', _this._handleBtnValidatesClick);
    });

    // bind button event click
    this._btnSetRevisions = [].slice.call(document.querySelectorAll('[data-revisions]'));

    this._btnSetRevisions.forEach(function (input) {
      input.addEventListener('click', _this._handleBtnValidatesClick);
    });
  }

  _createClass(FormList, [{
    key: '_btnValidatesClick',
    value: function _btnValidatesClick(e) {
      var tplPath = e.currentTarget.getAttribute('data-template-path');
      var filePath = e.currentTarget.getAttribute('data-file-path');
      var type = e.currentTarget.getAttribute('data-type');

      var data = {
        tplPath: tplPath,
        filePath: filePath,
        saveAction: type
      };

      $.ajax({
        url: document.location.origin + '/save',
        data: data
      }).done(function (res) {
        top.location.href = top.location.href;
      });
    }
  }]);

  return FormList;
}();

exports.default = FormList;