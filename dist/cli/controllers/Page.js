'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _handlebarsIntl = require('handlebars-intl');

var _handlebarsIntl2 = _interopRequireDefault(_handlebarsIntl);

var _handlebarsHelperSlugify = require('handlebars-helper-slugify');

var _handlebarsHelperSlugify2 = _interopRequireDefault(_handlebarsHelperSlugify);

var _htmlMinifier = require('html-minifier');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Page class
 * manage HTML generation for page template
 */

var Page = function () {

  /**
   * Create new page object
   * @param  {Object} params req.params from express route
   * @param  {Object} i18n tranduction
   * @param  {Function} callback 
   * @param  {Boolean} onlyHTML default = false, if true HTML content will contains abe attributs
   * @return {String} HTML page as string
   */

  function Page(path, text, json) {
    var _this = this;

    var onlyHTML = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    _classCallCheck(this, Page);

    this._onlyHTML = onlyHTML;

    // HOOKS beforePageText
    text = _.Hooks.instance.trigger('beforePageText', text, json, _handlebars2.default);

    // HOOKS beforePageJson
    json = _.Hooks.instance.trigger('beforePageJson', json);

    _handlebars2.default.registerHelper('abe', _.compileAbe); // HandlebarsJS unique text helper
    _handlebars2.default.registerHelper('i18nAbe', _.translate); // HandlebarsJS unique text helper
    _handlebars2.default.registerHelper('math', _.math); // HandlebarsJS unique text helper
    _handlebars2.default.registerHelper('moduloIf', _.moduloIf); // HandlebarsJS helper for modulo test
    _handlebars2.default.registerHelper('testObj', _.testObj); //
    _handlebars2.default.registerHelper('attrAbe', _.attrAbe); //
    _handlebars2.default.registerHelper('printJson', _.printJson);
    _handlebars2.default.registerHelper('printBlock', _.printBlock);
    _handlebars2.default.registerHelper('className', _.className);
    _handlebars2.default.registerHelper('cleanTab', _.cleanTab);
    _handlebars2.default.registerHelper('slugify', (0, _handlebarsHelperSlugify2.default)({ Handlebars: _handlebars2.default }).slugify);
    _handlebars2.default.registerHelper('printConfig', _.printConfig);
    _handlebars2.default.registerHelper('ifIn', _.ifIn);
    _handlebars2.default.registerHelper('ifCond', _.ifCond);
    _handlebars2.default.registerHelper('abeImport', _.abeImport);
    _handlebars2.default.registerHelper('listPage', _.listPage);
    _handlebarsIntl2.default.registerWith(_handlebars2.default);

    _.Hooks.instance.trigger('afterHandlebarsHelpers', _handlebars2.default);

    var util = new _.Util();
    var intlData = _.config.intlData;

    text = this._removeHidden(text);
    text = this._addAbeTag(text);

    _.abeEngine.instance.content = json;

    // var pattNode = />({{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g,
    var pattNode = /((?!"{{abe[\S\s]*?}}).{{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g,
        pattAttr = /( [A-Za-z0-9\-\_]+="*{{.*?}})/g,
        pattSpeAttr = /=[\'|\"]{{abe.*}}[\'|\"]/g,
        pattEach = />\s*(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g,
        arrayEach = [],
        match,
        textEach,
        textSpeAttr;

    function contains(arr, obj) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === obj) {
          return true;
        }
      }
      return false;
    }

    var open = [];

    function recurseSplit(str, c) {
      var splitEachs = text.split('{{#each ');
      var c = 0;
      // var cc = 0;
      var resStr = '';
      resStr += splitEachs.shift();
      Array.prototype.forEach.call(splitEachs, function (splitEach) {
        var splitEachStr = '{{#each-' + c + ' ' + splitEach;
        open.push(c);
        var splitEachsClose = splitEachStr.split('{{/each');
        resStr += splitEachsClose.shift();

        Array.prototype.forEach.call(splitEachsClose, function (splitEachClose) {
          var i = open.pop();
          resStr += '{{/each-' + i + splitEachClose;
        });

        c += 1;
      });

      return resStr;
    }
    var res = recurseSplit(text, 0);

    var textCountEach,
        pattCountEach = /\{\{#(each-.)/g,
        eaches = [];

    while (textCountEach = pattCountEach.exec(res)) {
      var ar = res.split('{{#' + textCountEach[1]);
      var start = '{{#each' + ar[1];
      var arr = start.split('{{/' + textCountEach[1] + '}}');
      var end = arr[0] + '{{/each}}';

      end = end.replace(/(each-.)/g, 'each');
      eaches.push(end);
    }

    Array.prototype.forEach.call(eaches, function (eache) {
      var keyArray = eache.match(/#each (\n|.)*?\}/);
      keyArray = keyArray[0].slice(6, keyArray[0].length - 1);
      var dataBlock = eache; //.replace(/(>\s*\{\{#each (\n|.)*?\}\})/, '').replace('{{/each}}', '')
      if (!_this._onlyHTML) {
        var meta = _.config.meta.name;
        var test = dataBlock.replace(/{{abe(.*?)}}/g, '[[abe$1]]').replace(new RegExp('\\.\\./' + meta, 'g'), meta);
        var template = _handlebars2.default.compile(dataBlock.replace(/{{abe(.*?)}}/g, '[[abe$1]]').replace(new RegExp('\\.\\./' + meta, 'g'), meta));

        var insertCompiled = template(json, { data: { intl: intlData } }).replace(/\[\[abe(.*?)\]\]/g, '{{abe$1}}');

        var textEachWithIndex = eache.replace(/(<(?![\/])[A-Za-z0-9!-]*)/g, '$1 data-abe-block="' + keyArray + '{{@index}}"');

        text = text.replace(eache, textEachWithIndex + ('<!-- [[' + keyArray + ']] ' + util.encodeAbe(insertCompiled) + ' -->'));
      }
      while (match = pattNode.exec(eache)) {
        text = _this._insertAbeEach(text, match, keyArray, pattEach.lastIndex - eache.length, util, util);
      }
      while (match = pattAttr.exec(eache)) {
        text = _this._insertAbeEach(text, match, keyArray, pattEach.lastIndex - eache.length, util, util);
      }
    });
    var matches = [];
    while (match = pattNode.exec(text)) {
      if (matches.indexOf(match[0]) === -1) {
        matches.push(match[0]);
      }
    }
    Array.prototype.forEach.call(matches, function (match) {
      text = _this._abeFunc(text, match);
      if (!_this._onlyHTML) {
        var getattr = (0, _.getAttr)(match, 'key').replace(/\./g, '-');
        text = text.replace((0, _.escapeTextToRegex)(match, 'g'), ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '" ' + match);
      }
    });
    while (match = pattAttr.exec(text)) {
      // While regexp match {{attribut}}, ex: link, image ...
      if (util.isSingleAbe(match[0], text)) {
        var more_attr = '';
        if (!this._onlyHTML) {
          var getattr = (0, _.getAttr)(match, 'key').replace(/\./g, '-');
          text = text.replace(new RegExp(match[0]), ' data-abe-attr-' + util.validDataAbe(getattr) + '="' + match[0].split('=')[0].trim() + '"' + ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '"' + more_attr + match[0].replace('}}', ' has-abe=1}}'));
        }
      }
    }

    var source = _.config.source.name;
    if (!this._onlyHTML && typeof json[source] !== 'undefined' && json[source] !== null) {
      var keys = Object.keys(json[source]);

      for (var i in keys) {
        var replaceEach = new RegExp('<!-- \\[\\[' + keys[i] + '\\]\\][\\s\\S]*?-->', 'g');
        text = text.replace(replaceEach, '');

        var patAttrSource = new RegExp(' ([A-Za-z0-9\-\_]+)=["|\'].*?({{' + keys[i] + '}}).*?["|\']', 'g');
        var patAttrSourceMatch = text.match(patAttrSource);

        if (typeof patAttrSourceMatch !== 'undefined' && patAttrSourceMatch !== null) {
          var patAttrSourceInside = new RegExp('(\\S+)=["\']?((?:.(?!["\']?\\s+(?:\\S+)=|[>"\']))+.)["\']?({{' + keys[i] + '}}).*?["|\']', 'g');
          Array.prototype.forEach.call(patAttrSourceMatch, function (pat) {
            var patAttrSourceCheck = patAttrSourceInside.exec(pat);
            if (typeof patAttrSourceCheck !== 'undefined' && patAttrSourceCheck !== null) {
              var checkEscaped = /["|'](.*?)["|']/;
              checkEscaped = checkEscaped.exec(patAttrSourceCheck[0]);
              if (typeof checkEscaped !== 'undefined' && checkEscaped !== null && checkEscaped.length > 0) {
                checkEscaped = escape(checkEscaped[1]);
                text = text.replace(patAttrSourceCheck[0], ' data-abe-attr="' + patAttrSourceCheck[1] + '" data-abe-attr-escaped="' + checkEscaped + '" data-abe="' + keys[i] + '" ' + patAttrSourceCheck[0]);
              }
            }
          });
        }

        // text = text.replace(
        //   new RegExp('{{(' + keys[i] + ')}}(?=(?:[^"]*"[^"]*")*[^"]*$)', 'g'),
        //   `<abe data-abe="$1" >{{$1}}</abe>`
        //   )
        var eachSource = new RegExp('({{#each ' + keys[i] + '}[\\s\\S a-z]*?{{/each}})', 'g');
        var matches = text.match(eachSource);
        if (typeof matches !== 'undefined' && matches !== null) {

          Array.prototype.forEach.call(matches, function (match) {
            if (!_this._onlyHTML) {
              text = text.replace(match, match + '<!-- [[' + keys[i] + ']] ' + util.encodeAbe(match) + ' -->');
            }
          });
        }
      }
    }

    this._addSource(text, json);
    text = _.Util.removeDataList(text);

    text = text.replace(/\[index\]\./g, '{{@index}}-');
    if (typeof text !== "undefined" && text !== null && typeof text.replace === "function") {
      // HOOKS afterPageText
      text = _.Hooks.instance.trigger('afterPageText', text, json, _handlebars2.default);

      // HOOKS afterPageJson
      json = _.Hooks.instance.trigger('afterPageJson', json);

      var template = _handlebars2.default.compile(!this._onlyHTML ? util.insertDebugtoolUtilities(text) : text);

      var tmp = template(json, {
        data: { intl: intlData }
      });

      _.log.delAndWrite('Index-new-page', 'result', text, json, tmp);
      this.html = tmp;
    }
  }

  _createClass(Page, [{
    key: '_insertAbeEach',
    value: function _insertAbeEach(text, theMatch, keyArray, lastIndex, util) {
      var matchBlock = theMatch[0];
      if (util.isEachStatement(matchBlock)) return;
      if (util.isBlockAbe(matchBlock)) {
        var matchblockattr = matchBlock.split('=')[0].trim();
        var getattr = (0, _.getAttr)(matchBlock, 'key').replace('.', '[index].');
        var newMatchBlock = (!this._onlyHTML ? (/=[\"\']\{\{(.*?)\}\}/g.test(matchBlock) ? ' data-abe-attr-' + util.validDataAbe(getattr) + '="' + matchblockattr + '"' : '') + ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '" ' + matchBlock : matchBlock).replace(new RegExp('(key=[\'|"])' + keyArray + '.', 'g'), '$1' + keyArray + '[index].').replace(/\{\{abe/, '{{abe dictionnary=\'' + keyArray + '\'');

        text = text.replace(matchBlock, newMatchBlock);
      }

      return text;
    }

    /**
     * add <abe> tag around html tag
     * @param {String} text html string
     */

  }, {
    key: '_removeHidden',
    value: function _removeHidden(text) {
      return text.replace(/(\{\{abe.*visible=[\'|\"]false.*\}\})/g, '');
    }

    /**
     * add <abe> tag around html tag
     * @param {String} text html string
     */

  }, {
    key: '_addAbeTag',
    value: function _addAbeTag(text) {
      // if 2 abe tag following each other add a space between them
      text = text.replace(/\}\}\{\{abe/g, '}} {{abe');
      text = text.replace(/>\{\{/g, '> {{');
      var pattTag = /((?!"{{abe[\S\s]*?}}).{{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g;

      if (!this._onlyHTML) {
        var match;
        while (match = pattTag.exec(text)) {
          text = text.replace((0, _.escapeTextToRegex)(match[1], 'g'), ' <abe>' + match[1].trim() + '</abe>');
          text = text.replace(/<abe> <abe>/g, '<abe>');
          text = text.replace(/<\/abe><\/abe>/g, '</abe>');
        }
      }
      text = text.replace(/> \{\{/g, '>{{');

      return text;
    }

    /**
     * add handlebar {{if variable empty}} state if onlyHTML or "data-if-empty-clear" attribute
     * 
     * @param  {String} text      html
     * @param  {String} key       abe
     * @param  {String} tag       name
     * @param  {String} match     regex string to match
     * @param  {Boolean} onlyHTML boolean for generated html or browser
     * @return {String}           new text with if or data attributes
     */

  }, {
    key: '_abeClear',
    value: function _abeClear(text, key, tag, match) {
      var _this2 = this;

      var hideTagRegex;
      var hideHtmls = (0, _.getEnclosingTags)(text, match, tag);

      Array.prototype.forEach.call(hideHtmls, function (hideHtml) {
        if (_this2._onlyHTML) {
          hideTagRegex = (0, _.escapeTextToRegex)(hideHtml, 'gm');
          text = text.replace(hideTagRegex, '{{#if ' + key + '}}' + hideHtml + '{{/if}}');
        } else {
          var firstTag = /(<[^\s>]+)/.exec(hideHtml);
          firstTag = firstTag[0];

          var hideHtmlWithAttr = hideHtml.replace(firstTag, firstTag + ' data-if-empty-clear="' + key + '"');
          text = text.replace((0, _.escapeTextToRegex)(hideHtml, 'g'), hideHtmlWithAttr);
        }
      });

      return text;
    }
  }, {
    key: '_addSource',
    value: function _addSource(text, json) {
      var listReg = /({{abe.*type=[\'|\"]data.*}})/g,
          match,
          limit = 0;

      while (match = listReg.exec(text)) {
        var type = 'text',
            editable = (0, _.getAttr)(match[0], 'editable'),
            key = (0, _.getAttr)(match[0], 'key'),
            display = (0, _.getAttr)(match[0], 'display'),
            desc = (0, _.getAttr)(match[0], 'desc'),
            maxLength = (0, _.getAttr)(match[0], 'max-length'),
            tab = (0, _.getAttr)(match[0], 'tab');

        editable = typeof editable === 'undefined' || editable === null || editable === '' || editable === 'false' ? false : true;

        var eachSource = new RegExp('{{#each ' + key + '}');
        maxLength = eachSource.test(text) ? maxLength : 1;
        var source = _.config.source.name;

        if (!editable) {
          json[key] = json[source][key];
        }
      }
    }

    /**
     * check if abe tag own a custom attribute
     * 
     * @param  {String} text      html
     * @param  {String} tag       name
     * @param  {String} match     regex string to match
     * @return {String}           new text with if or data attributes
     *
     * for example :
     *
     * {{abe type="" if-empty="clear(something)"}}
     *
     * will call methode abeClear on this tag
     */

  }, {
    key: '_abeFunc',
    value: function _abeFunc(text, match) {
      var ifEmpty = (0, _.getAttr)(match, 'if-empty');
      var key = (0, _.getAttr)(match, 'key');

      if (ifEmpty !== '') {
        var tag = /\(([^)]+)\)/g.exec(ifEmpty);
        var func = /([^)]+)\(/g.exec(ifEmpty);

        if (typeof func[1] !== 'undefined' && func[1] !== null) {
          switch (func[1]) {
            case 'clear':
              if (typeof tag[1] !== 'undefined' && tag[1] !== null) {
                text = this._abeClear(text, key, tag[1], match);
              }
              break;
          }
        }
      }

      return text;
    }
  }]);

  return Page;
}();

exports.default = Page;