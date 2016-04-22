'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.abeEngine = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.compileAbe = compileAbe;
exports.attrAbe = attrAbe;
exports.testObj = testObj;
exports.ifIn = ifIn;
exports.ifCond = ifCond;
exports.hasWorkFlow = hasWorkFlow;
exports.addWorkflow = addWorkflow;
exports.printBlock = printBlock;
exports.printInput = printInput;
exports.listPage = listPage;
exports.moduloIf = moduloIf;
exports.className = className;
exports.printJson = printJson;
exports.folders = folders;
exports.printConfig = printConfig;
exports.cleanTab = cleanTab;
exports.math = math;
exports.notEmpty = notEmpty;
exports.translate = translate;
exports.abeImport = abeImport;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _handlebarsIntl = require('handlebars-intl');

var _handlebarsIntl2 = _interopRequireDefault(_handlebarsIntl);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var abeEngine = function () {
  function abeEngine(enforcer) {
    _classCallCheck(this, abeEngine);

    if (enforcer != singletonEnforcer) throw "Cannot construct Json singleton";
    this._content = {};
  }

  _createClass(abeEngine, [{
    key: 'content',
    get: function get() {
      return this._content;
    },
    set: function set(content) {
      this._content = content;
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new abeEngine(singletonEnforcer);
      }
      return this[singleton];
    }
  }]);

  return abeEngine;
}();

exports.abeEngine = abeEngine;

/**
 * Abe handlebar helper, that retrieve text to add to handlebars templating engine
 * @return {String} the string to replace {{ handlebars_key }}
 */

function compileAbe() {
  var content = abeEngine.instance.content;
  var keyAttr = typeof arguments[0].hash['key_text'] !== 'undefined' ? 'key_text' : 'key';

  if (arguments[0].hash[keyAttr].indexOf('}-') > 0) {

    var key = arguments[0].hash[keyAttr].split('-');
    key = key[key.length - 1];
    var hash = arguments[0].hash;
    hash.key = hash.key.replace(/\{\{@index\}\}/, '[{{@index}}]');
    return new _handlebars2.default.SafeString(content ? content[hash['dictionnary']][arguments[0].data.index][key] : hash.key);
  }

  var key = arguments[0].hash[keyAttr].replace('.', '-');

  var hash = arguments[0].hash;
  var value = content ? content[hash.key.replace('.', '-')] : hash.key;
  if (typeof value === 'undefined' || value === null) {
    value = '';
  }
  return new _handlebars2.default.SafeString(value);
}

/**
 * Print properties inside html tag
 * @param  {String} attr exemple: atl, title, ...
 * @param  {[type]} value value of the property
 * @return {String} the value to print inside the attribut
 */
function attrAbe(attr, value) {
  var content = abeengine._content;
  return new _handlebars2.default.SafeString(value);
}

function testObj(ctx) {
  console.log(ctx);
  console.log('\n\n----------\n\n');
}

function ifIn(actions, currentAction, options) {
  for (var action in actions) {
    if (action === currentAction) return options.fn(this);
  }
  return '';
}

function ifCond(v1, v2, options) {
  v1 = v1 === 'null' ? null : v1;
  v2 = v2 === 'null' ? null : v2;
  if (v1 === v2) return options.fn(this);
  return options.inverse(this);
}

function hasWorkFlow(workflow, options) {
  var checkFlow = false;
  for (var prop in workflow) {
    if (workflow[prop] !== false) checkFlow = true;
  }

  if (checkFlow) return options.fn(this);
  return options.inverse(this);
}

function addWorkflow(flows, userFlow, currentFlow, text) {
  var res = _.Hooks.instance.trigger('beforeAddWorkflow', flows, userFlow, currentFlow, text);
  var displayFlow = 'draft';
  flows = ['draft'].concat(flows);
  flows = flows.concat('publish');

  var foundFlow = false;
  var keepGoing = true;
  var hasReject = false;
  var i = 0;

  if (currentFlow === 'draft') {
    res += '<button class=\'btn btn-info btn-save btn-hidden\' data-action="draft">\n            <span class="before">\n              ' + text.save + '\n            </span>\n            <span class="loading">\n              ' + text.saving + '\n            </span>\n            <span class="after">\n              ' + text.done + '\n            </span>\n          </button>';
  }

  flows.forEach(function (flow) {
    if (!keepGoing) return;

    if (userFlow.workflow.indexOf(flow) > -1 && flow !== 'draft') {
      displayFlow = foundFlow ? flow : 'reject';

      if (displayFlow !== 'reject' && currentFlow !== flow || !hasReject && displayFlow === 'reject') {
        res += '<button class=\'btn btn-info btn-save\' data-action="' + displayFlow + '">\n                  <span class="before">\n                    ' + displayFlow + '\n                  </span>\n                  <span class="loading">\n                    ' + text.saving + '\n                  </span>\n                  <span class="after">\n                    ' + text.done + '\n                  </span>\n                </button>';
      }
      if (foundFlow) keepGoing = false;
      if (displayFlow === 'reject') hasReject = true;
    }

    if (currentFlow === flow || userFlow.index == i++) foundFlow = true;
  });

  res += _.Hooks.instance.trigger('afterAddWorkflow', flows, userFlow, currentFlow, text);

  return res;
}

function sourceAttr(val, params) {
  var hiddenVal = val;
  var selected = '';

  if ((typeof hiddenVal === 'undefined' ? 'undefined' : _typeof(hiddenVal)) === 'object' && Object.prototype.toString.call(hiddenVal) === '[object Object]') {
    hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, "&apos;");

    var displayVal = _.Sql.deep_value_array(val, params.display);
    if (typeof params.display !== 'undefined' && params.display !== null && typeof displayVal !== 'undefined' && displayVal !== null) {
      val = displayVal;
    } else {
      val = val[Object.keys(val)[0]];
    }
  }

  if (_typeof(params.value) === 'object' && Object.prototype.toString.call(params.value) === '[object Array]') {
    Array.prototype.forEach.call(params.value, function (v) {
      var item = v;
      var displayV = _.Sql.deep_value_array(item, params.display);
      if (typeof params.display !== 'undefined' && params.display !== null && typeof displayV !== 'undefined' && displayV !== null) {
        item = displayV;
      } else {
        if (typeof v === 'string') {
          item = v;
        } else {
          item = v[Object.keys(v)[0]];
        }
      }
      if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && Object.prototype.toString.call(val) === '[object Array]' && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && Object.prototype.toString.call(item) === '[object Array]') {

        Array.prototype.forEach.call(item, function (i) {
          if (val.includes(i)) {
            selected = 'selected="selected"';
          }
        });
      } else if (val === item) {
        selected = 'selected="selected"';
      }
    });
  } else if (params.value === hiddenVal) {
    selected = 'selected="selected"';
  }

  return {
    hiddenVal: hiddenVal,
    selected: selected,
    val: val
  };
}

function sourceAutocomplete(val, params) {
  var attr = sourceAttr(val, params);
  return '<div class="autocomplete-result" value=\'' + attr.hiddenVal + '\' data-parent-id=\'' + params.key + '\' ' + attr.selected + '>\n    ' + attr.val + '\n    <span class="glyphicon glyphicon-remove" data-autocomplete-remove="true"></span>\n  </div>';
}

function sourceOption(val, params) {
  var attr = sourceAttr(val, params);
  return '<option value=\'' + attr.hiddenVal + '\' ' + attr.selected + '>' + attr.val + '</option>';
}

function printBlock(ctx) {
  var res = '';

  if (typeof ctx[0].block !== 'undefined' && ctx[0].block !== null && ctx[0].block !== '') {
    res += '<div class="form-group">\n              <label class="title">' + ctx[0].block + '</label>\n              <div class=\'single-block well well-sm\'>';
    Array.prototype.forEach.call(ctx, function (item) {
      res += printInput(item);
    });
    res += '</div></div>';
  } else if (ctx[0].key.indexOf('[') > -1) {
    var ctxBlock = ctx[0].key.split('[')[0];
    res += '<div class="form-group">\n              <div class="list-group" data-block="' + ctxBlock + '" >\n                <label>\n                  ' + ctxBlock + '\n                </label>';

    var arrItem = [];
    Array.prototype.forEach.call(ctx, function (item) {
      var index = item.key.match(/[^\[\]]+?(?=\])/);
      if (typeof arrItem[index] === 'undefined' || arrItem[index] === null) {
        arrItem[index] = [];
      }
      arrItem[index].push(item);
    });

    Array.prototype.forEach.call(Object.keys(arrItem), function (i) {
      var key = arrItem[i][0].key.split('[')[0];
      var display = '';
      if (typeof abeEngine.instance.content[key] === 'undefined' || abeEngine.instance.content[key] === null || abeEngine.instance.content[key].length === 0) {
        display = 'style="display: none"';
      }
      res += '<div class="list-block" data-block="' + key + i + '" ' + display + '>\n                              <button type="button" class="btn btn-info collapsed" data-toggle="collapse" data-target="#' + key + i + '" >\n                                <span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>\n                              </button>\n                              <div id="' + key + i + '" class="collapse" >';
      Array.prototype.forEach.call(arrItem[i], function (item) {
        res += printInput(item);
      });
      res += '</div></div>';
    });

    res += '\n          </div>\n          <button type="button" class="btn btn-success add-block" >\n            <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>\n          </button><button type="button" class="btn btn-danger remove-block" >\n            <span class="glyphicon glyphicon-minus" aria-hidden="true"></span>\n          </button>\n        </div>';
  } else {
    res += printInput(ctx[0]);
  }
  return res;
}

/**
 * Print form input based on input data type {Textarea | text | meta | link | image | ...}
 * && add appropriate attributs / data-attributs
 * @return {String|html} input / input group ...
 */
function printInput() {
  var params = arguments[0];

  params = _.Hooks.instance.trigger('beforeEditorInput', params);

  var res = '<div class="form-group">\n              <label for="' + params.key + '" \n                      ' + (params.type.indexOf('text_link') > -1 ? 'data-for-link="' + params.key + '"' : '') + ' >\n                ' + params.desc + '\n              </label>',
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
        res += sourceAutocomplete(val, params);
      });
      res += '</div>';
      res += '<input value="" autocomplete="off" data-value=\'' + lastValues + '\' type="text" ' + disabled + ' ' + commonParams + ' class="' + inputClass + '" />';
    } else {
      lastValues = JSON.stringify(params.value).replace(/\'/g, '&quote;');
      res += '<select ' + multiple + ' ' + disabled + ' ' + commonParams + ' class="' + inputClass + '"\n                        last-values=\'' + lastValues + '\'>\n              <option value=\'\'></option>';

      if (_typeof(params.source) === 'object' && Object.prototype.toString.call(params.source) === '[object Array]') {
        Array.prototype.forEach.call(params.source, function (val) {
          res += sourceOption(val, params);
        });
      } else {
        res += sourceOption(params.source, params);
      }

      res += '</select>';
    }
  } else if (params.type.indexOf("rich") >= 0) {
    res += '<div class="wysiwyg-container rich">\n              <div class="wysiwyg-toolbar wysiwyg-toolbar-top">\n                <a class="wysiwyg-toolbar-icon" href="#" title="Bold (Ctrl+B)" hotkey="b" data-action="bold" data-param="">\n                  <span class="glyphicon glyphicon-bold"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Italic (Ctrl+I)" hotkey="i" data-action="italic" data-param="">\n                  <span class="glyphicon glyphicon-italic"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Underline (Ctrl+U)" hotkey="u" data-action="underline" data-param="">\n                  <span class="glyphicon underline">U</span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Text color" data-action="forecolor" data-param="" data-popup="color">\n                  <span class="glyphicon glyphicon-text-color"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Background color" data-action="highlight" data-param="" data-popup="color">\n                  <span class="glyphicon glyphicon-text-background"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Left" data-action="align" data-param="left">\n                  <span class="glyphicon glyphicon-object-align-left"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Center" data-action="align" data-param="center">\n                  <span class="glyphicon glyphicon-object-align-vertical"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Right" data-action="align" data-param="right">\n                  <span class="glyphicon glyphicon-object-align-right"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Justify" data-action="justify" data-param="justify">\n                  <span class="glyphicon glyphicon-menu-hamburger"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Subscript" data-action="subscript" data-param="">\n                  <span class="glyphicon glyphicon-subscript"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Superscript" data-action="superscript" data-param="">\n                  <span class="glyphicon glyphicon-superscript"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Indent" data-action="indent" data-param="">\n                  <span class="glyphicon glyphicon-triangle-right"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Outdent" data-action="indent" data-param="outdent">\n                  <span class="glyphicon glyphicon-triangle-left"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Unordered list" data-action="insertList" data-param="">\n                  <span class="glyphicon glyphicon-th-list"></span>\n                </a>\n                <a class="wysiwyg-toolbar-icon" href="#" title="Remove format" data-action="removeFormat" data-param="">\n                  <span class="glyphicon glyphicon-remove"></span>\n                </a>\n              </div>\n              <textarea class="' + inputClass + ' form-rich"\n                        ' + commonParams + '\n                        rows="4">' + params.value + '</textarea>\n            </div>';
  } else if (params.type.indexOf("file") >= 0) {
    res += '<input class="form-control" ' + commonParams + ' name="' + params.key + '" type="file" />\n            <span class="percent"></span>\n            <input type="text" ' + commonParams + ' class="' + inputClass + ' hidden" />';
  } else if (params.type.indexOf("textarea") >= 0) {
    res += '<textarea class="' + inputClass + '" ' + commonParams + ' rows="4">' + params.value + '</textarea>';
  } else if (params.type.indexOf("link") >= 0) {
    res += '<div class="input-group">\n            <div class="input-group-addon link">\n              <span class="glyphicon glyphicon-link" aria-hidden="true"></span>\n            </div>\n            <input type="text" ' + commonParams + ' class="' + inputClass + '" />\n          </div>';
  } else if (params.type.indexOf("image") >= 0) {
    res += '<div class="input-group img-upload">\n            <div class="input-group-addon image">\n              <span class="glyphicon glyphicon-picture" aria-hidden="true"></span>\n            </div>\n            <input type="text" ' + commonParams + ' class="' + inputClass + ' image-input" />\n            <div class="upload-wrapper">\n              <input class="form-control" ' + commonParams + ' name="' + params.key + '" type="file" title="upload an image"/>\n              <span class="percent">\n                <span class="glyphicon glyphicon-upload" aria-hidden="true"></span>\n              </span>\n            </div>\n          </div>';
  } else {
    res += '<div class="input-group">\n            <div class="input-group-addon">\n              <span class="glyphicon glyphicon-font" aria-hidden="true"></span>\n              </div>\n              <input type="text" ' + commonParams + ' class="' + inputClass + '" />\n            </div>';
  }

  res += '</div>';

  res = _.Hooks.instance.trigger('afterEditorInput', res, params);

  return res;
}

/**
 * 
 */
function listPage(file, workflow, index, action, text) {
  var resWorkflow = '';
  var res = _.Hooks.instance.trigger('beforeListPage', file, workflow, index, action, text);
  res += '<tr>';
  res += '<td>' + math(index, '+', 1) + '</td>\n        <td>\n          <a href="/abe/' + file.template + '?filePath=' + file.path + '" class="file-path">\n            ' + file.path + '\n          </a>\n        </td>';

  if (file.date) {
    res += '<td align="center">\n              ' + (0, _moment2.default)(file.date).format('YYYY-MM-DD') + '\n            </td>';
  }

  var checkFlow = false;
  for (var prop in workflow) {
    var flow = workflow[prop];
    if (flow !== false) checkFlow = true;
    resWorkflow += '<td align="center">';

    if (flow.filePath && flow.latest) {
      resWorkflow += '<a href="/abe/' + file.template + '?filePath=' + file.path + '" class="label label-default label-workflow">' + prop + '</a>';
    }
    resWorkflow += '</td>';
  }

  res += '<td align="center">';
  if (typeof file.draft !== 'undefined' && file.draft !== null) {
    if (!checkFlow && (!file.published || file.published.abe_meta.date !== file.draft.abe_meta.latest.date)) {
      res += '<a href="/abe/{{this.template}}?filePath={{this.draft.cleanFilePath}}" class="label label-default label-draft">';
      res += file.draft.abe_meta.complete === 100 ? 'draft' : file.draft.abe_meta.complete + '%';
      res += '</a>';
    }
  }

  res += '</td>\n          ' + resWorkflow + '\n          <td align="center">';

  if (file.published) {
    res += '<a href="/abe/' + file.template + '?filePath=' + file.published.filePath + '" class="checkmark">&#10004;</a>';
  }
  res += '</td>\n          <td align="center">\n            <div class="row icons-action">\n              <div class="col-xs-6">';

  if (this.published) {
    if (action.unpublish) {
      res += '<a href="/unpublish/?filePath=' + file.path + '"\n                 title="' + text.unpublish + '"\n                 class="icon" data-unpublish="true"data-text="' + text.confirmUnpublish + ' {{file.path}}">\n                <span class="glyphicon glyphicon-eye-close"></span>\n              </a>';
    }
  }

  res += '</div>\n          <div class="col-xs-6">';

  if (action.delete) {
    res += '<a href="/delete/?filePath=' + this.path + '"\n               title="' + text.delete + '"\n               class="icon"\n               data-delete="true"\n               data-text="' + text.confirmDelete + ' ' + file.path + '">\n              <span class="glyphicon glyphicon-trash"></span>\n            </a>';
  }

  res += '</div>\n        </div>\n      </td>\n    </tr>';

  var res = _.Hooks.instance.trigger('afterListPage', res, file, workflow, index, action, text);

  return new _handlebars2.default.SafeString(res);
}

/**
 * Handlebars helper, conditionnal modulo
 * @param  {Int} num number to test
 * @param  {Int} mod modulo number
 * @param  {String} block text block content inside of {{#moduloIf}} ... {{/moduloIf}}
 * @return {String|html} if true return the block compiled by handlebar inside our template, if not void
 */
function moduloIf(num, mod, block) {
  if (parseInt(num + 1) % parseInt(mod) === 0) {
    return block.fn(this);
  }
}

/**
 * Handlebars helper, to print className and escape it string
 */
function className(str) {
  return str.replace(/\.| |\#/g, '_');
}

/**
 * Handlebars helper, to print json object
 */
function printJson(obj) {
  return JSON.stringify(obj);
}

function recursiveFolder(obj) {
  var index = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var dataShow = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

  var classHidden = '';
  if (index > 1) {
    classHidden = 'hidden';
  }

  var id = 'level-' + index;
  if (typeof dataShow !== 'undefined' && dataShow !== null && dataShow !== '') {
    id += '-' + dataShow;
  }
  var parent = obj[0] ? obj[0].cleanPath.split('/')[0] : '';
  var res = '<div class="form-group level-' + index + ' ' + classHidden + '" data-parent="' + parent + '" data-shown="' + dataShow + '">\n    <label for="' + id + '" class="col-sm-5 control-label">Level ' + index + '</label>\n    <div class="col-sm-7">\n      <select data-show-hide-sub-folder="true" id="' + id + '" class="form-control">\n        <option data-level-hide="' + (index + 1) + '"></option>';

  var sub = '';

  Array.prototype.forEach.call(obj, function (o) {
    res += '<option data-level-hide="' + (index + 2) + '" data-level-show="' + (index + 1) + '" data-show="' + o.name.replace(/\.| |\#/g, '_') + '">' + o.name + '</option>';

    if (typeof o.folders !== 'undefined' && o.folders !== null && o.folders.length > 0) {
      sub += recursiveFolder(o.folders, index + 1, o.name.replace(/\.| |\#/g, '_'));
    }
  });

  res += '</select>\n    </div>\n  </div>';

  res += sub;

  return res;
}

function folders(obj) {
  var res = recursiveFolder(obj);

  return res;
}

function recursivePrintConfig(obj) {
  var key = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  var res = '';

  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
    Array.prototype.forEach.call(Object.keys(obj), function (k) {
      var strKey = key;
      if (strKey !== '') {
        strKey += '.';
      }
      strKey += k;
      res += recursivePrintConfig(obj[k], strKey);
    });
  } else {
    res += '<div class="form-group">\n      <label class="col-sm-4 control-label" for="' + key + '">' + key + '</label>\n      <div class="col-sm-8">\n        <input type="text" class="form-control" id="' + key + '" data-json-key="' + key + '" placeholder="' + obj + '" value="' + obj + '">\n      </div>\n    </div>';
  }

  return res;
}

function printConfig(obj) {
  var res = recursivePrintConfig(obj);

  return res;
}

function cleanTab(obj) {
  obj = _.Util.replaceUnwantedChar(obj.replace(/ |&/g, '_'));

  return obj;
}

function math(lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue
  }[operator];
}

/**
 */
function notEmpty(variable) {
  if (typeof variable !== 'undefined' && variable !== null && variable !== '') {
    return block.fn(this);
  } else {
    return '';
  }
}

function translate(lang, str) {
  var trad = _.Locales.instance.i18n;
  if (typeof trad[lang] !== 'undefined' && trad[lang] !== null && typeof trad[lang][str] !== 'undefined' && trad[lang][str] !== null) {
    return trad[lang][str];
  }
  return str;
}

_handlebars2.default.registerHelper('abe', compileAbe); // HandlebarsJS unique text helper
_handlebars2.default.registerHelper('i18nAbe', translate); // HandlebarsJS unique text helper
_handlebars2.default.registerHelper('math', math); // HandlebarsJS unique text helper
_handlebars2.default.registerHelper('moduloIf', moduloIf); // HandlebarsJS helper for modulo test
_handlebars2.default.registerHelper('testObj', testObj); //
_handlebars2.default.registerHelper('cleanTab', cleanTab); //
_handlebars2.default.registerHelper('attrAbe', attrAbe); //
_handlebars2.default.registerHelper('notEmpty', notEmpty);
_handlebars2.default.registerHelper('printJson', printJson);
_handlebars2.default.registerHelper('className', className);
_handlebars2.default.registerHelper('folders', folders);
_handlebars2.default.registerHelper('printConfig', printConfig);
_handlebars2.default.registerHelper('ifIn', ifIn);
_handlebars2.default.registerHelper('ifCond', ifCond);
_handlebars2.default.registerHelper('printInput', printInput);
_handlebars2.default.registerHelper('printBlock', printBlock);
_handlebars2.default.registerHelper('abeImport', abeImport);
_handlebars2.default.registerHelper('addWorkflow', addWorkflow);
_handlebars2.default.registerHelper('hasWorkFlow', hasWorkFlow);
_handlebars2.default.registerHelper('listPage', listPage);
_handlebarsIntl2.default.registerWith(_handlebars2.default);

function abeImport(file, config, ctx) {
  var config = JSON.parse(config);
  var defaultPartials = __dirname.replace(/\/$/, "") + '/' + config.defaultPartials.replace(/\/$/, "");
  var partials = config.partials !== '' ? config.root.replace(/\/$/, "") + '/' + config.partials.replace(/\/$/, "") : defaultPartials;

  var pathToPartial = partials + '/' + file + '.html';
  try {
    var stat = _fsExtra2.default.statSync(pathToPartial);
  } catch (e) {
    var pathToPartial = defaultPartials + '/' + file + '.html';
  }
  var html = _fsExtra2.default.readFileSync(pathToPartial, 'utf8');

  var pluginsPartials = _.Plugins.instance.getPartials();
  Array.prototype.forEach.call(pluginsPartials, function (pluginPartials) {
    var checkFile = _.fileUtils.concatPath(pluginPartials, file + '.html');
    if (_.fileUtils.isFile(checkFile)) {
      html += _fsExtra2.default.readFileSync(checkFile, 'utf8');
    }
  });
  var template = _handlebars2.default.compile(html);

  return new _handlebars2.default.SafeString(template(ctx));
}