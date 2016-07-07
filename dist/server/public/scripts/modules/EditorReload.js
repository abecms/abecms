'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _es6Promise = require('es6-promise');

var _EditorJson = require('../modules/EditorJson');

var _EditorJson2 = _interopRequireDefault(_EditorJson);

var _iframe = require('../utils/iframe');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Reload = function () {
  function Reload(enforcer) {
    _classCallCheck(this, Reload);

    this._ajax = _nanoajax2.default.ajax;
    this._json = _EditorJson2.default.instance;

    if (enforcer != singletonEnforcer) throw "Cannot construct Reload singleton";
  }

  _createClass(Reload, [{
    key: '_nodeScriptReplace',
    value: function _nodeScriptReplace(node) {
      if (this._nodeScriptIs(node) === true) {
        node.parentNode.replaceChild(this._nodeScriptClone(node), node);
      } else {
        var i = 0;
        var children = node.childNodes;
        while (i < children.length) {
          this._nodeScriptReplace(children[i++]);
        }
      }

      return node;
    }
  }, {
    key: '_nodeScriptIs',
    value: function _nodeScriptIs(node) {
      return node.tagName === 'SCRIPT';
    }
  }, {
    key: '_nodeScriptClone',
    value: function _nodeScriptClone(node) {
      var script = document.createElement("script");
      script.text = node.innerHTML;
      for (var i = node.attributes.length - 1; i >= 0; i--) {
        script.setAttribute(node.attributes[i].name, node.attributes[i].value);
      }
      return script;
    }
  }, {
    key: 'reload',
    value: function reload() {
      var iframe = document.querySelector('#page-template');
      var iframeBody = (0, _iframe.IframeDocument)('#page-template').body;
      var scrollTop = iframeBody.scrollTop;
      var json = JSON.parse(JSON.stringify(this._json.data));
      delete json.abe_source;
      var data = _qs2.default.stringify({
        json: json
      });

      this._ajax({
        url: iframe.src,
        body: data,
        method: 'post'
      }, function (code, responseText, request) {

        var str = responseText;
        // str = str.replace(/<[\s\S]+(?=<head>)/, '')
        // str = str.replace(/<\/html>/, '')
        // var matches = str.match(/src=['|"]([\S\s]*?)['|"]/g)
        // if(typeof matches !== 'undefined' && matches !== null) {
        //   Array.prototype.forEach.call(matches, (match) => {
        //     let matchReplace = match.substring(5, match.length-1)
        //     if(matchReplace.trim() !== "") {
        //       str = str.replace(matchReplace, `${matchReplace}?v${parseInt(Math.random() * 999999999999)}`)
        //     }
        //   })
        // }

        var doc = iframe.contentWindow.document;
        doc.open();
        doc.write(str);
        doc.close();

        setTimeout(function () {
          (0, _iframe.IframeDocument)('#page-template').body.scrollTop = scrollTop;
        }, 1000);

        return;
      });
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new Reload(singletonEnforcer);
        window.formJson = this[singleton];
      }
      return this[singleton];
    }
  }]);

  return Reload;
}();

exports.default = Reload;