'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
  res += '<td>' + (0, _math2.default)(index, '+', 1) + '</td>\n        <td>\n          <a href="/abe/' + file.abe_meta.template + '?filePath=' + file.abe_meta.link + '" class="file-path">\n            ' + file.abe_meta.link + '\n          </a>\n        </td>';

  if (file.abe_meta.template) {
    res += '<td align="center">\n              ' + file.abe_meta.template + '\n            </td>';
  } else {
    res += '<td align="center"></td>';
  }

  if (file.date) {
    var dateSearch = (0, _moment2.default)(file.date).format('YYYY-MM-DD');
    var dateOrder = new Date(file.date).getTime();
    res += '<td align="center" data-search="' + dateSearch + '" data-order="' + dateOrder + '">\n              ' + dateSearch + '\n            </td>';
  } else {
    res += '<td align="center" data-search="0000-00-00" data-order="0"></td>';
  }

  var workflow = '';

  workflow += '<td align="center" class="draft">';
  if (typeof file.publish === "undefined" || file.publish === null || file.publish && file.draft && file.publish.date < file.draft.date) {
    workflow += '<a href="/abe/' + file.abe_meta.template + '?filePath=' + file.draft.html + '" class="label label-default label-draft">draft</a>';
  } else {
    workflow += '<a href="/abe/' + file.abe_meta.template + '?filePath=' + file.draft.html + '" class="hidden label label-default label-draft">draft</a>';
  }

  workflow += '</td>';
  workflow += '<td align="center" class="publish">';

  if (file.publish) {
    workflow += '<a href="/abe/' + file.abe_meta.template + '?filePath=' + file.abe_meta.link + '" class="checkmark label-published">&#10004;</a>';
  }
  workflow += '</td>';

  workflow = _.Hooks.instance.trigger('afterListPageDraft', workflow, file, index, text);
  res += workflow;

  res += '<td align="center">\n            <div class="row icons-action">';

  if (typeof file.publish !== 'undefined' && file.publish !== null) {
    res += '<a href="/unpublish/?filePath=' + file.abe_meta.link + '"\n               title="' + text.unpublish + '"\n               class="icon" data-unpublish="true" data-text="' + text.confirmUnpublish + ' ' + file.abe_meta.link + '">\n              <span class="glyphicon glyphicon-eye-close"></span>\n            </a>';
  }

  res += '<a href="/delete/?filePath=' + file.abe_meta.link + '"\n             title="' + text.delete + '"\n             class="icon"\n             data-delete="true"\n             data-text="' + text.confirmDelete + ' ' + file.abe_meta.link + '">\n            <span class="glyphicon glyphicon-trash"></span>\n          </a>';

  res += '\n        </div>\n      </td>\n    </tr>';

  res = _.Hooks.instance.trigger('afterListPage', res, file, index, text);
  return new _handlebars2.default.SafeString(res);
}