'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = recursiveFolder;
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