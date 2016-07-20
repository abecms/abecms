'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EditorUtils = require('../modules/EditorUtils');

var _EditorUtils2 = _interopRequireDefault(_EditorUtils);

var _EditorInputs = require('../modules/EditorInputs');

var _EditorInputs2 = _interopRequireDefault(_EditorInputs);

var _iframe = require('../utils/iframe');

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _es6Promise = require('es6-promise');

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorFiles = function () {
  function EditorFiles() {
    _classCallCheck(this, EditorFiles);

    this._filePathEle = document.getElementById('file-path');
    this.onUpload = (0, _on2.default)(this);
    this._handleChangeFiles = this._changeFiles.bind(this);
    this.rebind();
  }

  _createClass(EditorFiles, [{
    key: 'rebind',
    value: function rebind() {
      var _this = this;

      var files = [].slice.call(document.querySelectorAll('.img-upload input[type="file"]'));

      Array.prototype.forEach.call(files, function (file) {
        file.removeEventListener('change', _this._handleChangeFiles);
        file.addEventListener('change', _this._handleChangeFiles);
      });
    }
  }, {
    key: '_changeFiles',
    value: function _changeFiles(e) {
      this._uploadFile(e.target);
    }
  }, {
    key: '_uploadFile',
    value: function _uploadFile(target) {
      var _this2 = this;

      var formData = new FormData();
      if (target.value == '') {
        console.log("Please choose file!");
        return false;
      }
      _EditorUtils2.default.scrollToInputElement(target);
      var parentTarget = target.parentNode.parentNode;
      var percent = parentTarget.querySelector('.percent');
      var percentHtml = percent.innerHTML;
      var file = target.files[0];
      var uploadError = parentTarget.nextElementSibling;

      uploadError.classList.remove('show');
      uploadError.textContent = '';

      formData.append('uploadfile', file);
      var xhr = new XMLHttpRequest();
      xhr.open('post', '/upload/?baseUrl=' + CONFIG.FILEPATH + '&input=' + target.outerHTML, true);
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
          var percentage = e.loaded / e.total * 100;
          percent.textContent = percentage.toFixed(0) + '%';
        }
      };
      xhr.onerror = function (e) {
        console.log('An error occurred while submitting the form. Maybe your file is too big');
      };
      xhr.onload = function () {
        var resp = JSON.parse(xhr.responseText);
        if (resp.error) {
          uploadError.textContent = resp.response;
          uploadError.classList.add('show');
          percent.innerHTML = percentHtml;
          return;
        }
        var input = parentTarget.querySelector('input.image-input');
        input.value = resp.filePath;
        input.focus();
        input.blur();
        // window.inpt = input

        var nodes = (0, _iframe.IframeNode)('#page-template', '[data-abe-' + input.id + ']');
        Array.prototype.forEach.call(nodes, function (node) {
          _EditorUtils2.default.formToHtml(node, input);
        });
        _this2.onUpload._fire(target);
        setTimeout(function () {
          percent.innerHTML = percentHtml;
        }, 1000);
      };
      percent.textContent = '0%';
      xhr.send(formData);
    }
  }]);

  return EditorFiles;
}();

exports.default = EditorFiles;