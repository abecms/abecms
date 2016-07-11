'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = printInput;

var _sourceAutocomplete = require('./sourceAutocomplete');

var _sourceAutocomplete2 = _interopRequireDefault(_sourceAutocomplete);

var _sourceOption = require('./sourceOption');

var _sourceOption2 = _interopRequireDefault(_sourceOption);

var _ = require('../../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Print form input based on input data type {Textarea | text | meta | link | image | ...}
 * && add appropriate attributs / data-attributs
 * @return {String|html} input / input group ...
 */
function printInput() {
  var params = arguments[0];

  params = _.Hooks.instance.trigger('beforeEditorInput', params);
  var desc = params.desc + (params.required ? ' *' : '');

  var res = '<div class="form-group">\n              <label class="control-label" for="' + params.key + '" \n                      ' + (params.type.indexOf('text_link') > -1 ? 'data-for-link="' + params.key + '"' : '') + ' >\n                ' + desc + '\n              </label>',
      disabled = '';

  if (typeof params.placeholder === 'undefined' || params.placeholder === null || params.placeholder === 'undefined') {
    params.placeholder = '';
  }

  if (typeof params.value === 'undefined' || params.value === null) {
    params.value = '';
  }

  var inputClass = 'form-control form-abe';
  var commonParams = 'id="' + params.key + '"\n                    data-id="' + params.key + '"\n                    value="' + params.value + '"\n                    maxlength="' + params.maxLength + '"\n                    reload="' + params.reload + '"\n                    tabIndex="' + params.order + '"\n                    data-required="' + params.required + '"\n                    data-display="' + params.display + '"\n                    data-visible="' + params.visible + '"\n                    data-autocomplete="' + params.autocomplete + '"\n                    placeholder="' + params.placeholder + '"';

  if (typeof params.source !== 'undefined' && params.source !== null) {
    commonParams = 'id="' + params.key + '"\n                    data-id="' + params.key + '"\n                    data-maxlength="' + params.maxLength + '"\n                    reload="' + params.reload + '"\n                    tabIndex="' + params.order + '"\n                    data-required="' + params.required + '"\n                    data-display="' + params.display + '"\n                    data-visible="' + params.visible + '"\n                    data-autocomplete="' + params.autocomplete + '"\n                    placeholder="' + params.placeholder + '"';

    var multiple = '';
    var disabled = '';
    if (typeof params.maxLength === 'undefined' || params.maxLength === null || params.maxLength === '' || params.maxLength > 1 && params.source.length > 0) {
      multiple = 'multiple';
    }
    if (params.source.length <= 0) {
      disabled = 'disabled';
    }

    var lastValues;
    if (typeof params.autocomplete !== 'undefined' && params.autocomplete !== null && (params.autocomplete === 'true' || params.autocomplete === 'true')) {
      if (params.source.indexOf('http') === 0) {
        lastValues = params.source;
      } else {
        lastValues = JSON.stringify(params.source).replace(/\'/g, '&quote;');
      }
      res += '<div class="autocomplete-result-wrapper">';
      Array.prototype.forEach.call(params.value, function (val) {
        res += (0, _sourceAutocomplete2.default)(val, params);
      });
      res += '</div>';
      res += '<input value="" autocomplete="off" data-value=\'' + lastValues + '\' type="text" ' + disabled + ' ' + commonParams + ' class="' + inputClass + '" />';
    } else {
      lastValues = JSON.stringify(params.value).replace(/\'/g, '&quote;');
      res += '<select ' + multiple + ' ' + disabled + ' ' + commonParams + ' class="' + inputClass + '"\n                        last-values=\'' + lastValues + '\'>\n              <option value=\'\'></option>';

      if (_typeof(params.source) === 'object' && Object.prototype.toString.call(params.source) === '[object Array]') {
        Array.prototype.forEach.call(params.source, function (val) {
          res += (0, _sourceOption2.default)(val, params);
        });
      } else {
        res += (0, _sourceOption2.default)(params.source, params);
      }

      res += '</select>';
    }
  } else if (params.type.indexOf("rich") >= 0) {
    commonParams = 'id="' + params.key + '"\n                    data-id="' + params.key + '"\n                    maxlength="' + params.maxLength + '"\n                    reload="' + params.reload + '"\n                    tabIndex="' + params.order + '"\n                    data-required="' + params.required + '"\n                    data-display="' + params.display + '"\n                    data-visible="' + params.visible + '"\n                    data-autocomplete="' + params.autocomplete + '"\n                    placeholder="' + params.placeholder + '"';

    res += '<div class="wysiwyg-container rich">\n              <div class="wysiwyg-toolbar wysiwyg-toolbar-top">\n                <a class="wysiwyg-toolbar-icon" href="#" title="Bold (Ctrl+B)" hotkey="b" data-action="bold" data-param="">\n                  <span class="glyphicon glyphicon-bold"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Italic (Ctrl+I)" hotkey="i" data-action="italic" data-param="">\n                  <span class="glyphicon glyphicon-italic"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Underline (Ctrl+U)" hotkey="u" data-action="underline" data-param="">\n                  <span class="glyphicon underline">U</span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Text color" data-action="forecolor" data-param="" data-popup="color">\n                  <span class="glyphicon glyphicon-text-color"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Background color" data-action="highlight" data-param="" data-popup="color">\n                  <span class="glyphicon glyphicon-text-background"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Left" data-action="align" data-param="left">\n                  <span class="glyphicon glyphicon-object-align-left"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Center" data-action="align" data-param="center">\n                  <span class="glyphicon glyphicon-object-align-vertical"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Right" data-action="align" data-param="right">\n                  <span class="glyphicon glyphicon-object-align-right"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Justify" data-action="justify" data-param="justify">\n                  <span class="glyphicon glyphicon-menu-hamburger"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Subscript" data-action="subscript" data-param="">\n                  <span class="glyphicon glyphicon-subscript"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Superscript" data-action="superscript" data-param="">\n                  <span class="glyphicon glyphicon-superscript"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Indent" data-action="indent" data-param="">\n                  <span class="glyphicon glyphicon-triangle-right"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Outdent" data-action="indent" data-param="outdent">\n                  <span class="glyphicon glyphicon-triangle-left"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Unordered list" data-action="insertList" data-param="">\n                  <span class="glyphicon glyphicon-th-list"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Remove format" data-action="removeFormat" data-param="">\n                  <span class="glyphicon glyphicon-remove"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Add link" data-action="insertLink" data-popup="link" data-param="">\n                  <span class="glyphicon glyphicon-link"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Code style" data-action="code" data-param="">\n                  <span class="glyphicon glyphicon-console"></span>\n                </a>\n              </div>\n              <textarea class="' + inputClass + ' form-rich"\n                        ' + commonParams + '\n                        rows="4">' + params.value + '</textarea>\n            </div>';
  } else if (params.type.indexOf("file") >= 0) {
    res += '<input class="form-control" ' + commonParams + ' name="' + params.key + '" type="file" />\n            <span class="percent"></span>\n            <input type="text" ' + commonParams + ' class="' + inputClass + ' hidden" />';
  } else if (params.type.indexOf("textarea") >= 0) {
    res += '<textarea class="' + inputClass + '" ' + commonParams + ' rows="4">' + params.value + '</textarea>';
  } else if (params.type.indexOf("link") >= 0) {
    res += '<div class="input-group">\n            <div class="input-group-addon link">\n              <span class="glyphicon glyphicon-link" aria-hidden="true"></span>\n            </div>\n            <input type="text" ' + commonParams + ' class="' + inputClass + '" />\n          </div>';
  } else if (params.type.indexOf("image") >= 0) {
    res += '<div class="input-group img-upload">\n              <div class="input-group-addon image">\n                <span class="glyphicon glyphicon-picture" aria-hidden="true"></span>\n              </div>\n              <input type="text" ' + commonParams + ' class="' + inputClass + ' image-input" />\n              <div class="upload-wrapper">\n                <input class="form-control" ' + commonParams + ' name="' + params.key + '" type="file" title="upload an image"/>\n                <span class="percent">\n                  <span class="glyphicon glyphicon-upload" aria-hidden="true"></span>\n                </span>\n              </div>\n            </div>\n            <div class="input-error"></div>';
  } else {
    res += '<div class="input-group">\n            <div class="input-group-addon">\n              <span class="glyphicon glyphicon-font" aria-hidden="true"></span>\n              </div>\n              <input type="text" ' + commonParams + ' class="' + inputClass + '" />\n            </div>';
  }

  res += '</div>';

  res = _.Hooks.instance.trigger('afterEditorInput', res, params);

  return res;
}