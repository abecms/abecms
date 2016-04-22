'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FolderSelect = function () {
  function FolderSelect() {
    _classCallCheck(this, FolderSelect);

    // constante variable
    this._selectTemplate = document.querySelector('#selectTemplate');
    this._selectsWebsite = document.querySelector('#level-1');
    this._selectsCreate = [].slice.call(document.querySelectorAll('select[id*="level-"]'));

    // constante methode
    this._handleChangeSelectsCreate = this._changeSelectsCreate.bind(this);

    this._bindEvents();
  }

  _createClass(FolderSelect, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this = this;

      this._selectsCreate.forEach(function (select) {
        select.addEventListener('change', _this._handleChangeSelectsCreate);
      });
    }

    /**
     * bind event for select page create
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_changeSelectsCreate',
    value: function _changeSelectsCreate(e) {
      var selectedOption = e.currentTarget.querySelector('option:checked');

      var website = this._selectsWebsite.querySelector('option:checked').value;

      var dataShow = selectedOption.getAttribute('data-show'),
          levelShow = selectedOption.getAttribute('data-level-show'),
          levelHide = selectedOption.getAttribute('data-level-hide'),
          levels = void 0;

      if (typeof levelShow !== 'undefined' && levelShow !== null && levelShow !== '') {
        this._showSubLevels(levelShow, dataShow);
      }
      if (typeof levelHide !== 'undefined' && levelHide !== null && levelHide !== '') {
        this._hideSubLevels(levelHide);
      }
    }
  }, {
    key: '_hideSubLevels',
    value: function _hideSubLevels(i) {
      var levels = [].slice.call(document.querySelectorAll('.level-' + i));
      while (levels.length > 0) {
        levels.forEach(function (level) {
          var options = [].slice.call(level.querySelectorAll('option'));
          Array.prototype.forEach.call(options, function (option) {
            option.selected = null;
            option.removeAttribute('selected');
          });
          level.classList.add('hidden');
        });
        levels = [].slice.call(document.querySelectorAll('.level-' + i++));
      }
    }
  }, {
    key: '_showSubLevels',
    value: function _showSubLevels(i, dataShow) {
      var levels = [].slice.call(document.querySelectorAll('.level-' + i));
      var level1selected = document.querySelector('.level-1 select').value;
      levels.forEach(function (level) {
        level.classList.add('hidden');

        // console.log([].slice.call(document.querySelectorAll(`[data-shown=${dataShow}][data-parent=${level1selected}]`)))
        var childs = [].slice.call(document.querySelectorAll('[data-shown=' + dataShow + '][data-parent=' + level1selected + ']'));
        if (childs) {
          childs.forEach(function (child) {
            var options = [].slice.call(child.querySelectorAll('option'));
            Array.prototype.forEach.call(options, function (option) {
              option.selected = null;
              option.removeAttribute('selected');
            });

            child.classList.remove('hidden');
          });
        }
      });
    }
  }]);

  return FolderSelect;
}();

exports.default = FolderSelect;