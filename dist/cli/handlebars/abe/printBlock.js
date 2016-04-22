'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = printBlock;

var _printInput = require('./printInput');

var _printInput2 = _interopRequireDefault(_printInput);

var _abeEngine = require('./abeEngine');

var _abeEngine2 = _interopRequireDefault(_abeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function printBlock(ctx) {
  var res = '';

  if (typeof ctx[0].block !== 'undefined' && ctx[0].block !== null && ctx[0].block !== '') {
    res += '<div class="form-group">\n              <label class="title">' + ctx[0].block + '</label>\n              <div class=\'single-block well well-sm\'>';
    Array.prototype.forEach.call(ctx, function (item) {
      res += (0, _printInput2.default)(item);
    });
    res += '</div></div>';
  } else if (ctx[0].key.indexOf('[') > -1) {
    var ctxBlock = ctx[0].key.split('[')[0];
    res += '<div class="form-group">\n              <div class="list-group" data-block="' + ctxBlock + '" >\n                <label>\n                  ' + ctxBlock + '\n                  <button type="button" class="btn btn-success add-block" title="Add new block" >\n                    <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>\n                  </button>\n                </label>';

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
      if (typeof _abeEngine2.default.instance.content[key] === 'undefined' || _abeEngine2.default.instance.content[key] === null || _abeEngine2.default.instance.content[key].length === 0) {
        display = 'style="display: none"';
      }
      res += '<div class="list-block" data-block="' + key + i + '" ' + display + '>\n                <button type="button" class="btn btn-info collapsed" data-toggle="collapse" data-target="#' + key + i + '" >\n                  Section <span class=\'label-count\'>' + i + '</span> :\n                  <span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>\n                </button>\n                <button type="button" class="btn btn-danger remove-block" title="Delete block" >\n                  <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\n                </button>\n                <div id="' + key + i + '" class="collapse" >\n                ';
      Array.prototype.forEach.call(arrItem[i], function (item) {
        res += (0, _printInput2.default)(item);
      });
      res += '</div></div>';
    });

    res += '\n          </div>\n        </div>';
  } else {
    res += (0, _printInput2.default)(ctx[0]);
  }
  return res;
}