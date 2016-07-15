'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = listPage;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _math = require('../utils/math');

var _math2 = _interopRequireDefault(_math);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _ = require('../../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function listPage(file, index, text) {
  var res = '';
  file = _.Hooks.instance.trigger('beforeListPage', file, index, text);

  res += '<tr>';
  res += '<td>' + (0, _math2.default)(index, '+', 1) + '</td>\n        <td>\n          <a href="/abe/' + file.template + '?filePath=' + file.path + '" class="file-path">\n            ' + file.path + '\n          </a>\n        </td>';

  if (file.date) {
    res += '<td align="center">\n              ' + (0, _moment2.default)(file.date).format('YYYY-MM-DD') + '\n            </td>';
  }

  var workflow = '';

  workflow += '<td align="center" class="draft">';
  if (_typeof(file.published) !== undefined && file.published !== null && !file.published || file.published && file.draft && file.published.date < file.draft.date) {
    workflow += '<a href="/abe/' + file.template + '?filePath=' + file.path + '" class="label label-default label-draft">draft</a>';
  } else {
    workflow += '<a href="/abe/' + file.template + '?filePath=' + file.path + '" class="hidden label label-default label-draft">draft</a>';
  }

  workflow += '</td>';
  workflow += '<td align="center" class="publish">';

  if (file.published) {
    workflow += '<a href="/abe/' + file.template + '?filePath=' + file.published.filePath + '" class="checkmark label-published">&#10004;</a>';
  }
  workflow += '</td>';

  workflow = _.Hooks.instance.trigger('afterListPageDraft', workflow, file, index, text);
  res += workflow;

  res += '<td align="center">\n            <div class="row icons-action">';

  if (this.published) {
    res += '<a href="/unpublish/?filePath=' + file.path + '"\n               title="' + text.unpublish + '"\n               class="icon" data-unpublish="true" data-text="' + text.confirmUnpublish + ' ' + file.path + '">\n              <span class="glyphicon glyphicon-eye-close"></span>\n            </a>';
  }

  res += '<a href="/delete/?filePath=' + this.path + '"\n             title="' + text.delete + '"\n             class="icon"\n             data-delete="true"\n             data-text="' + text.confirmDelete + ' ' + file.path + '">\n            <span class="glyphicon glyphicon-trash"></span>\n          </a>';

  res += '\n        </div>\n      </td>\n    </tr>';

  res = _.Hooks.instance.trigger('afterListPage', res, file, index, text);
  return new _handlebars2.default.SafeString(res);
}