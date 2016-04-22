'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Devtool = exports.Devtool = function () {
  function Devtool() {
    _classCallCheck(this, Devtool);

    this.body = $('body');
    this.form = $('.form-wrapper');
    this.form = $('.form-wrapper');
    this.ruler = $('.iframe-wrapper');
    this.initDevtool();
    this.updateBrowserSize();
  }

  // ABE devtool


  _createClass(Devtool, [{
    key: 'initDevtool',
    value: function initDevtool() {
      var _this = this;

      this.ruler.on('mousedown', function (e) {
        _this.body.addClass('resizing');
        _this.body.on('mousemove', function (e) {
          var newWidth = e.clientX / window.innerWidth * 100 + '%';
          _this.form.width(newWidth);
          _this.form.attr('data-width', newWidth);
          _this.updateBrowserSize();
        });
        _this.body.one('mouseup mouseleave', function () {
          _this.body.off('mousemove');
          _this.body.removeClass('resizing');
        });
      });
      $(window).on('resize', function () {
        _this.updateBrowserSize();
        _this.body.addClass('resizing');
        setTimeout(function () {
          _this.body.removeClass('resizing');
        }, 1000);
      });

      $('.close-engine').on('click', function (e) {
        _this.body.removeClass('engine-open');
        _this.form.width(0);
      });
      $('.open-engine').on('click', function (e) {
        _this.body.addClass('engine-open');
        _this.form.width(_this.form.attr('data-width'));
      });
    }
  }, {
    key: 'updateBrowserSize',
    value: function updateBrowserSize() {
      var $iframe = $('.iframe-wrapper iframe');
      $('.browser-size').text($iframe.width() + 'px x ' + $iframe.height() + 'px');
    }
  }]);

  return Devtool;
}();