'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iframe = require('../utils/iframe');

var _dom = require('../utils/dom');

var _colorPicker = require('../utils/color-picker');

var _colorPicker2 = _interopRequireDefault(_colorPicker);

var _linkPicker = require('../utils/link-picker');

var _linkPicker2 = _interopRequireDefault(_linkPicker);

var _richTexarea = require('../utils/rich-texarea');

var _richTexarea2 = _interopRequireDefault(_richTexarea);

var _EditorJson = require('./EditorJson');

var _EditorJson2 = _interopRequireDefault(_EditorJson);

var _EditorInputs = require('./EditorInputs');

var _EditorInputs2 = _interopRequireDefault(_EditorInputs);

var _EditorUtils = require('./EditorUtils');

var _EditorUtils2 = _interopRequireDefault(_EditorUtils);

var _on = require('on');

var _on2 = _interopRequireDefault(_on);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorBlock = function () {
  function EditorBlock() {
    _classCallCheck(this, EditorBlock);

    this._json = _EditorJson2.default.instance;
    this.color = new _colorPicker2.default(document.querySelector('.wysiwyg-popup.color'));
    this.link = new _linkPicker2.default(document.querySelector('.wysiwyg-popup.link'));

    this._removeblock = [].slice.call(document.querySelectorAll('.list-group[data-block]'));
    this._handleClickRemoveBlock = this._clickRemoveBlock.bind(this);

    this._addblock = [].slice.call(document.querySelectorAll('.add-block'));
    this._handleClickAddBlock = this._clickAddBlock.bind(this);

    this.onNewBlock = (0, _on2.default)(this);
    this.onRemoveBlock = (0, _on2.default)(this);

    this._bindEvents();
  }

  /**
   * bind events
   * @return {[type]} [description]
   */


  _createClass(EditorBlock, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this = this;

      this._removeblock.forEach(function (block) {
        block.addEventListener('click', _this._handleClickRemoveBlock);
      });
      this._addblock.forEach(function (block) {
        block.addEventListener('click', _this._handleClickAddBlock);
      });
    }

    /**
     * event remove block
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_clickRemoveBlock',
    value: function _clickRemoveBlock(e) {
      var target = e.target,
          elem = target,
          parent = null,
          listGroup = null,
          iframeRefAll = null,
          blockAttr = '',
          wasFound = false,
          startNumber = 0,
          endNumber = 0;

      if (elem.classList.contains('glyphicon-trash') || elem.classList.contains('remove-block')) {
        for (; elem && elem !== document; elem = elem.parentNode) {
          if (elem.hasAttribute('data-block')) {
            parent = elem;
            listGroup = parent.parentNode;
            blockAttr = listGroup.getAttribute('data-block');
            break;
          }
        }
      }

      if (parent && listGroup) {
        if (listGroup.querySelectorAll('[data-block]').length === 1) {
          var items = (0, _iframe.IframeNode)('#page-template', '[data-abe-block="' + blockAttr + '0"]');
          Array.prototype.forEach.call(items, function (item) {
            item.parentNode.removeChild(item);
          });
          var child = document.querySelector('[data-block=' + blockAttr + '0]');
          child.style.display = 'none';
          Array.prototype.forEach.call(child.querySelectorAll('.form-abe'), function (item) {
            item.value = '';
          });
          delete abe.json._data[blockAttr][0];
        } else {
          var toRemove = null;
          Array.prototype.forEach.call(listGroup.querySelectorAll('[data-block]'), function (block) {
            var currentBlockAttr = block.getAttribute('data-block');
            var nb = parseInt(currentBlockAttr.replace(blockAttr, ''));
            // iframeRefAll = IframeNode('#page-template', `[data-abe-block="${currentBlockAttr}"]`)
            if (wasFound) {
              Array.prototype.forEach.call(listGroup.querySelectorAll('.form-abe'), function (el) {
                el.setAttribute('value', el.value);
              });
              var blockId = blockAttr + (nb - 1);
              var html = block.innerHTML;

              html = html.replace(/data-block=(\'|\")(.*)(\'|\")/g, 'data-block="' + blockId + '"');
              html = html.replace(/data-target=(\'|\")(.*)(\'|\")/g, 'data-target="#' + blockId + '"');
              html = html.replace(new RegExp('id=(' + "\\'" + '|\\"' + ')' + blockAttr + '(\\d+)(' + "\\'" + '|\\"' + ')', 'g'), 'id="' + blockId + '"');
              html = html.replace(/\[(\d+)\]/g, '[' + (nb - 1) + ']');
              block.innerHTML = html;
              block.setAttribute('data-block', blockAttr + (nb - 1));
              var labelCount = block.querySelector('.label-count');
              labelCount.textContent = parseInt(labelCount.textContent) - 1;
              Array.prototype.forEach.call(block.querySelectorAll('label'), function (label) {
                label.textContent = label.textContent.replace(new RegExp(nb, 'g'), nb - 1);
              });

              Array.prototype.forEach.call((0, _iframe.IframeNode)('#page-template', '[data-abe-block="' + (blockAttr + nb) + '"]'), function (el) {
                el.parentNode.removeChild(el);
              });

              endNumber = nb;
            } else if (currentBlockAttr === parent.getAttribute('data-block')) {
              Array.prototype.forEach.call((0, _iframe.IframeNode)('#page-template', '[data-abe-block="' + (blockAttr + nb) + '"]'), function (el) {
                el.parentNode.removeChild(el);
              });

              toRemove = block;
              wasFound = true;
              startNumber = nb;
            }
          });

          toRemove.remove();

          var json = this._json.data;
          for (var i = startNumber; i < endNumber; i++) {
            this._insertNewBlock(blockAttr, i);
            Array.prototype.forEach.call(document.querySelectorAll('[data-block="' + blockAttr + i + '"] .form-abe'), function (el) {
              var key = el.getAttribute('data-id').split('-');
              if (key) {
                key = key[1];
                json[blockAttr][i][key] = el.value;
                var nodes = _EditorUtils2.default.getNode(_EditorUtils2.default.getAttr(el));
                Array.prototype.forEach.call(nodes, function (node) {
                  _EditorUtils2.default.formToHtml(node, el);
                });
              }
            });
          }
          json[blockAttr].pop();
          this._json.data = json;
        }
      }

      this.onRemoveBlock._fire();
    }

    /**
     * event add new block
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_clickAddBlock',
    value: function _clickAddBlock(e) {
      var target = e.currentTarget;
      var dataLink = target.getAttribute('data-id-link');
      var prevListItem = target.parentNode.parentNode.querySelectorAll('.list-block');
      var listGroupItem = prevListItem.length;
      prevListItem = prevListItem[prevListItem.length - 1];

      var attrId = typeof dataLink !== 'undefined' && dataLink !== null ? 'data-id-link' : 'data-id',
          itemNumber = 0,
          newNumber = 0,
          rex = new RegExp(itemNumber, 'g');

      if (listGroupItem > 1 || listGroupItem === 1 && prevListItem.style.display !== 'none') {
        newNumber = this._createNewBlock(prevListItem, itemNumber, newNumber);
        rex = new RegExp(newNumber - 1, 'g');
      } else {
        prevListItem.style.display = 'block';
      }

      prevListItem = target.parentNode.parentNode.querySelectorAll('.list-block');
      prevListItem = prevListItem[prevListItem.length - 1];
      var prevButton = prevListItem.querySelector('button');
      var dataTarget = prevButton.getAttribute('data-target');
      var newTarget = dataTarget.replace(rex, newNumber);

      var contentListItem = prevListItem.querySelector(dataTarget);
      contentListItem.setAttribute('id', newTarget.slice(1));
      contentListItem.setAttribute(attrId, newTarget.slice(1));

      prevButton.setAttribute('data-target', newTarget);
      this._insertNewBlock(prevListItem.parentNode.getAttribute('data-block'), newNumber);
      var labels = prevListItem.querySelectorAll('label');
      Array.prototype.forEach.call(labels, function (label) {
        label.innerHTML = label.innerHTML.replace(rex, newNumber);
      });

      if ($(target).parents('.list-group').find('.list-block').size() > 1) {
        prevListItem.querySelector('.label-count').textContent = parseInt(prevListItem.querySelector('.label-count').textContent) + 1;
      }

      this.onNewBlock._fire();

      if (typeof jQuery !== 'undefined' && jQuery !== null) {
        // Bootstrap collapse
        var blocks = $(target).parents('.list-group').find('.list-block > [data-id]');
        $(target).parents('.list-group').find('.list-block .collapse').collapse('hide');
        setTimeout(function () {
          $('#' + blocks[blocks.length - 1].id).collapse('show');
        }, 200);
      }
    }

    /**
     * insert node page side
     * @param  {[type]} dataBlock [description]
     * @param  {[type]} newNumber [description]
     * @return {[type]}           [description]
     */

  }, {
    key: '_insertNewBlock',
    value: function _insertNewBlock(dataBlock, newNumber) {
      var blockContent = (0, _iframe.IframeCommentNode)('#page-template', dataBlock);
      if (typeof blockContent !== 'undefined' && blockContent !== null && blockContent.length > 0) {
        blockContent = blockContent[0];
        var blockHtml = unescape(blockContent.textContent.replace(/\[\[([\S\s]*?)\]\]/, '')).replace(new RegExp('-' + dataBlock + '0', 'g'), '-' + dataBlock + newNumber).replace(/\[0\]-/g, '' + newNumber + '-');
        var newBlock = document.createElement('abe');
        newBlock.innerHTML = blockHtml;

        var childs = [].slice.call(newBlock.childNodes);
        Array.prototype.forEach.call(childs, function (child) {
          if (typeof child.setAttribute !== 'undefined' && child.setAttribute !== null) {
            child.setAttribute('data-abe-block', dataBlock + newNumber);
          }
          blockContent.parentNode.insertBefore(child, blockContent);
        });
      }
    }

    /**
     * remove default value into a form
     * @param  {[type]} block [description]
     * @return {[type]}       [description]
     */

  }, {
    key: '_unValueForm',
    value: function _unValueForm(block) {

      var inputs = [].slice.call(block.querySelectorAll('input'));
      Array.prototype.forEach.call(inputs, function (input) {
        input.value = '';
      });

      var textareas = [].slice.call(block.querySelectorAll('textarea'));
      Array.prototype.forEach.call(textareas, function (textarea) {
        textarea.value = '';
      });

      // var contenteditables = [].slice.call(block.querySelectorAll('[contenteditable]'))
      // Array.prototype.forEach.call(contenteditables, (contenteditable) => {
      //   contenteditable.innerHTML = ''
      // })

      var selects = [].slice.call(block.querySelectorAll('select'));
      Array.prototype.forEach.call(selects, function (select) {
        select.value = '';

        var options = [].slice.call(select.querySelectorAll('option'));
        Array.prototype.forEach.call(options, function (option) {
          option.removeAttribute('selected');
        });
      });
    }

    /**
     * Create admin side block
     * @param  {[type]} prevListItem [description]
     * @param  {[type]} itemNumber   [description]
     * @param  {[type]} newNumber    [description]
     * @return {[type]}              [description]
     */

  }, {
    key: '_createNewBlock',
    value: function _createNewBlock(prevListItem, itemNumber, newNumber) {
      var _this2 = this;

      var htmlBlockItem = prevListItem.innerHTML;

      htmlBlockItem = htmlBlockItem.replace(/\[(.*?)\]/g, function (val, $_1) {
        itemNumber = parseInt($_1);
        newNumber = itemNumber + 1;
        return '[' + newNumber + ']';
      });
      var rex = new RegExp(itemNumber, 'g');

      var dataBlock = prevListItem.getAttribute('data-block').replace(rex, newNumber);

      var newBlock = document.createElement('div');
      newBlock.classList.add('list-block');
      newBlock.setAttribute('data-block', dataBlock);
      newBlock.innerHTML = htmlBlockItem;
      var next = (0, _dom.nextSibling)(prevListItem.parentNode, prevListItem);
      prevListItem.parentNode.insertBefore(newBlock, next);
      this._unValueForm(newBlock);

      var richs = [].slice.call(newBlock.querySelectorAll('[contenteditable]'));
      if (typeof richs !== 'undefined' && richs !== null && richs.length > 0) {
        Array.prototype.forEach.call(richs, function (rich) {
          rich.remove();
        });
        var newRichs = [].slice.call(newBlock.querySelectorAll('.rich'));
        Array.prototype.forEach.call(newRichs, function (newRich) {
          new _richTexarea2.default(newRich, _this2.color, _this2.link);
        });
      }

      return newNumber;
    }
  }]);

  return EditorBlock;
}();

exports.default = EditorBlock;