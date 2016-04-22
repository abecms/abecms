'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iframe = require('../utils/iframe');

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _math = require('../../../../cli/handlebars/utils/math');

var _math2 = _interopRequireDefault(_math);

var _translateFront = require('../../../../cli/handlebars/utils/translate-front');

var _translateFront2 = _interopRequireDefault(_translateFront);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_handlebars2.default.registerHelper('math', _math2.default); // HandlebarsJS unique text helper
_handlebars2.default.registerHelper('i18nAbe', _translateFront2.default); // HandlebarsJS unique text helper

var EditorUtils = function () {
  function EditorUtils() {
    _classCallCheck(this, EditorUtils);
  }

  _createClass(EditorUtils, null, [{
    key: 'checkAttribute',
    value: function checkAttribute() {
      var formAbes = document.querySelectorAll('.form-abe');

      Array.prototype.forEach.call(formAbes, function (formAbe) {
        var hide = (0, _iframe.IframeNode)('#page-template', '[data-if-empty-clear="' + formAbe.getAttribute('data-id') + '"]')[0];
        if (typeof hide !== 'undefined' && hide !== null) {
          if (formAbe.value === '') {
            hide.style.display = 'none';
          } else {
            hide.style.display = '';
          }
        }
      });
    }
  }, {
    key: 'scrollToInputElement',
    value: function scrollToInputElement(target) {
      var visible = target.getAttribute('data-visible');
      if (visible === 'false' || visible === false) {
        return;
      }
      var dataLink = target.getAttribute('data-id-link');
      var id = target.getAttribute('data-id');
      var nodes = (0, _iframe.IframeNode)('#page-template', '[data-abe-' + id + ']');

      if (typeof nodes === 'undefined' || nodes === null || nodes.length === 0) {
        var nodesComment = [].slice.call((0, _iframe.IframeCommentNode)('#page-template', id.split('[')[0]));
        if (typeof nodesComment !== 'undefined' && nodesComment !== null && typeof nodesComment.textContent !== 'undefined' && nodesComment.textContent !== null) {
          var blockHtml = unescape(nodesComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, ''));

          var newBlock = document.createElement('abe');
          newBlock.innerHTML = blockHtml;

          var childs = [].slice.call(newBlock.childNodes);
          Array.prototype.forEach.call(childs, function (child) {
            nodesComment.parentNode.insertBefore(child, nodesComment);
          });
        } else if (typeof nodesComment !== 'undefined' && nodesComment !== null) {
          Array.prototype.forEach.call(nodesComment, function (nodeComment) {
            if (typeof nodeComment.parentNode.offsetParent !== 'undefined' && nodeComment.parentNode.offsetParent !== null) {
              var bounds = nodeComment.parentNode.getBoundingClientRect();
              var w = document.getElementById('page-template').contentWindow;
              w.scroll(0, w.scrollY + bounds.top + bounds.height * 0.5 - window.innerHeight * 0.5);
            }
          });
        }

        nodes = (0, _iframe.IframeNode)('#page-template', '[data-abe-' + id + ']');
      }

      Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add('select-border');
      });

      // scroll to DOM node
      if (typeof nodes[0] !== 'undefined' && nodes[0] !== null) {
        var bounds = nodes[0].getBoundingClientRect();
        var w = document.getElementById('page-template').contentWindow;
        w.scroll(0, w.scrollY + bounds.top + bounds.height * 0.5 - window.innerHeight * 0.5);
      }
    }
  }, {
    key: 'getAttr',
    value: function getAttr(target) {
      var dataLink = target.getAttribute('data-id-link');
      var id = target.getAttribute('data-id');

      return {
        abe: 'data-abe-' + id.replace(/\[([0-9]*)\]/g, '$1'),
        id: id
      };
    }
  }, {
    key: 'getNode',
    value: function getNode(attr) {
      var nodes = (0, _iframe.IframeNode)('#page-template', '[' + attr.abe + ']');

      if (typeof nodes === 'undefined' || nodes === null) {
        var blockContent = (0, _iframe.IframeNode)('#page-template', '.insert-' + attr.id.split('[')[0])[0];
        var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]\./g, attr.id.split('[')[0] + '[0]-');
        blockContent.insertBefore(blockHtml, blockContent);
        nodes = (0, _iframe.IframeNode)('#page-template', '[' + attr.abe + '="' + attr.id + '"]');
      }

      Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add('select-border');
      });

      return nodes;
    }

    /**
     * get input value and set to iframe html
     * @param  {Object} node  html node
     * @param  {Object} input input elem
     * @return {null}
     */

  }, {
    key: 'formToHtml',
    value: function formToHtml(node, input) {
      var val = input.value;
      var id = input.id;
      var placeholder = input.getAttribute('placeholder');
      if (typeof placeholder === 'undefined' || placeholder === 'undefined' || placeholder === null) {
        placeholder = "";
      }
      if (val.replace(/^\s+|\s+$/g, '').length < 1) {
        val = placeholder;
      }

      switch (input.nodeName.toLowerCase()) {
        case 'input':
          var dataAbeAttr = node.getAttribute('data-abe-attr-' + id.replace(/\[([0-9]*)\]/g, '$1'));
          if (typeof dataAbeAttr !== 'undefined' && dataAbeAttr !== null) {
            node.setAttribute(dataAbeAttr, val);
          } else {
            node.innerHTML = val;
          }
          break;
        case 'textarea':
          node.innerHTML = input.classList.contains('form-rich') ? input.parentNode.querySelector('[contenteditable]').innerHTML : val;
          break;
        case 'select':
          var key = node.getAttribute('data-abe-' + id);
          var dataAbeAttr = node.getAttribute('data-abe-attr-' + id.replace(/\[([0-9]*)\]/g, '$1'));
          var dataAbeAttrEscaped = unescape(node.getAttribute('data-abe-attr-escaped'));
          var option = input.querySelector('option:checked');
          if (typeof option !== 'undefined' && option !== null) {
            val = option.value;
            if (typeof dataAbeAttr !== 'undefined' && dataAbeAttr !== null) {
              var template = _handlebars2.default.compile(dataAbeAttrEscaped, { noEscape: true });
              var json = {};
              json[key] = val;
              var compiled = template(json);
              node.setAttribute(dataAbeAttr, compiled);
            } else {
              node.innerHTML = val;
            }
          }
          break;
      }
    }
  }]);

  return EditorUtils;
}();

exports.default = EditorUtils;