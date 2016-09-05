'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

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
   * @param  {Object} i18n translation
   * @param  {Function} callback 
   * @param  {Boolean} onlyHTML default = false, if true HTML content will contains abe attributes
   * @return {String} HTML page as string
   */
  function Page(templateId, template, json) {
    var onlyHTML = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    _classCallCheck(this, Page);

    var dateStart = new Date();

    // HOOKS beforePageJson
    json = _.Hooks.instance.trigger('beforePageJson', json);

    if (typeof _handlebars2.default.templates[templateId] !== 'undefined' && _handlebars2.default.templates[templateId] !== null && _.config.files.templates.precompile) {

      var template = _handlebars2.default.templates[templateId];
      this.html = template(json, { data: { intl: _.config.intlData } });

      //console.log('precompile')
    } else {

      this._onlyHTML = onlyHTML;
      this.template = template;
      this.HbsTemplatePath = _.fileUtils.getTemplatePath('hbs/' + templateId + '.hbs');

      var util = new _.Util();

      _.abeEngine.instance.content = json;

      // This pattern finds all abe tags which are not enclosed in a html tag attribute
      // it finds this one: <title>{{abe type='text' key='meta_title' desc='Meta title' tab='Meta' order='4000'}}</title>
      // it excludes this one: <meta name="description" content='{{abe type="text" key="meta_description" desc="Meta description" tab="Meta" order="4100"}}"/> 
      this.abePattern = /[^"']({{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g;

      // This pattern finds all abe tags enclosed in a HTML tag attribute
      this.abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1}{{abe.*?}})/g;

      // This pattern finds all {{#each ...}}...{{/each}} blocks
      this.eachBlockPattern = />\s*(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g;

      // This pattern finds all {{#each ...}}...{{/each}} blocks
      this.blockPattern = /(\{\{#each.*\}\}[\s\S]*?\{\{\/each\}\})/g;

      // Remove text with attribute "visible=false"
      this._removeHidden();

      if (!this._onlyHTML) {

        // Surrounds each Abe tag (which are text/rich/textarea and not in html attribute) with <abe> tag
        // ie. <title><abe>{{abe type='text' key='meta_title' desc='Meta title' tab='Meta' order='4000'}}</abe></title>
        this._encloseAbeTag();
      }

      // je rajoute les index pour chaque bloc lié à un each
      this._indexEachBlocks();

      if (!this._onlyHTML) {

        // Je maj les attributs associés aux Abe qui sont dans des attributs de tag HTML
        this._updateAbeAsAttribute();

        // je rajoute les attributs pour les tags Abe (qui ne sont pas dans un attribut HTML)
        this._updateAbeAsTag();
      }

      this._addSource(json);

      // We remove the {{abe type=data ...}} from the text 
      this.template = _.Util.removeDataList(this.template);

      // It's time to replace the [index] by {{@index}} (concerning each blocks)
      this.template = this.template.replace(/\[index\]\./g, '{{@index}}-');

      // Let's persist the precompiled template for future use (kind of cache)
      _fsExtra2.default.writeFileSync(this.HbsTemplatePath, _handlebars2.default.precompile(this.template), 'utf8');
      _.Manager.instance.loadHbsTemplates();

      // I compile the text
      var compiledTemplate = _handlebars2.default.compile(!this._onlyHTML ? util.insertDebugtoolUtilities(this.template) : this.template);

      // I create the html page ! yeah !!!
      this.html = compiledTemplate(json, { data: { intl: _.config.intlData } });
    }

    if (this._onlyHTML) {
      this.html = _.Hooks.instance.trigger('afterPageSaveCompile', this.html, json);
    } else {
      this.html = _.Hooks.instance.trigger('afterPageEditorCompile', this.html, json);
    }

    //console.log('result: ' + ((new Date().getTime() - dateStart.getTime()) / 1000))
  }

  _createClass(Page, [{
    key: '_updateAbeAsAttribute',
    value: function _updateAbeAsAttribute() {
      var match;
      var util = new _.Util();

      while (match = this.abeAsAttributePattern.exec(this.template)) {
        // While regexp match {{attribut}}, ex: link, image ...
        if (util.isSingleAbe(match[0], this.template)) {
          var more_attr = '';
          var getattr = (0, _.getAttr)(match, 'key').replace(/\./g, '-');
          this.template = this.template.replace(new RegExp(match[0]), ' data-abe-attr-' + util.validDataAbe(getattr) + '="' + match[0].split('=')[0].trim() + '"' + ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '"' + more_attr + match[0].replace('}}', ' has-abe=1}}'));
        }
      }

      return this;
    }
  }, {
    key: '_updateAbeAsTag',
    value: function _updateAbeAsTag() {
      var match;
      var util = new _.Util();

      while (match = this.abePattern.exec(this.template)) {
        var getattr = (0, _.getAttr)(match, 'key').replace(/\./g, '-');
        this.template = this.template.replace((0, _.escapeTextToRegex)(match[0], 'g'), ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '" ' + match[0]);
      }

      return this;
    }

    /**
     * [_indexEachBlocks description]
     * @param  {[type]} text   [description]
     * @param  {[type]} blocks [description]
     * @return {[type]}        [description]
     */

  }, {
    key: '_indexEachBlocks',
    value: function _indexEachBlocks() {
      var _this = this;

      // create an array of {{each}} blocks
      var blocks = this._splitEachBlocks();

      Array.prototype.forEach.call(blocks, function (block) {
        var key = block.match(/#each (.*)\}\}/);
        key = key[1];
        var util = new _.Util();
        var match;

        if (!_this._onlyHTML) {

          // je rajoute un data-able-block avec index sur tous les tags html du bloc each
          var textEachWithIndex = block.replace(/(<(?![\/])[A-Za-z0-9!-]*)/g, '$1 data-abe-block="' + key + '{{@index}}"');

          // je remplace le block dans le texte par ça
          _this.template = _this.template.replace(block, textEachWithIndex);
        }

        // Pour chaque tag Abe, je mets en forme ce tag avec des data- supplémentaires
        while (match = _this.abePattern.exec(block)) {
          _this._insertAbeEach(match, key, _this.eachBlockPattern.lastIndex - block.length, util);
        }

        // Pour chaque tag Abe attribut de HTML, je mets en forme ce tag avec des data- supplémentaires sur le tag html parent
        while (match = _this.abeAsAttributePattern.exec(block)) {
          _this._insertAbeEach(match, key, _this.eachBlockPattern.lastIndex - block.length, util);
        }
      });

      return this;
    }

    /**
     * create an array of {{#each}} blocks from the html document
     * @param  {String} html the html document
     * @return {Array}      the array of {{#each}} blocks
     */

  }, {
    key: '_splitEachBlocks',
    value: function _splitEachBlocks() {
      var block;
      var blocks = [];

      while (block = this.blockPattern.exec(this.template)) {
        blocks.push(block[1]);
      }

      return blocks;
    }
  }, {
    key: '_insertAbeEach',
    value: function _insertAbeEach(theMatch, key, lastIndex, util) {
      var matchBlock = theMatch[0];
      if (util.isEachStatement(matchBlock)) return;
      if (util.isBlockAbe(matchBlock)) {
        var matchblockattr = matchBlock.split('=')[0].trim();
        var getattr = (0, _.getAttr)(matchBlock, 'key').replace('.', '[index].');
        var newMatchBlock = (!this._onlyHTML ? (/=[\"\']\{\{(.*?)\}\}/g.test(matchBlock) ? ' data-abe-attr-' + util.validDataAbe(getattr) + '="' + matchblockattr + '"' : '') + ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '" ' + matchBlock : matchBlock).replace(new RegExp('(key=[\'|"])' + key + '.', 'g'), '$1' + key + '[index].').replace(/\{\{abe/, '{{abe dictionnary=\'' + key + '\'');

        this.template = this.template.replace(matchBlock, newMatchBlock);
      }

      return this;
    }

    /**
     * add <abe> tag around html tag
     * @param {String} text html string
     */

  }, {
    key: '_removeHidden',
    value: function _removeHidden() {
      this.template = this.template.replace(/(\{\{abe.*visible=[\'|\"]false.*\}\})/g, '');

      return this;
    }

    /**
     * add <abe> tag around html tag
     * @param {String} text html string
     */

  }, {
    key: '_encloseAbeTag',
    value: function _encloseAbeTag() {
      var match;
      while (match = this.abePattern.exec(this.template)) {
        this.template = this.template.replace((0, _.escapeTextToRegex)(match[1], 'g'), '<abe>' + match[1].trim() + '</abe>');
      }

      return this;
    }
  }, {
    key: '_addSource',
    value: function _addSource(json) {
      var listReg = /({{abe.*type=[\'|\"]data.*}})/g;
      var match;
      var limit = 0;

      while (match = listReg.exec(this.template)) {
        var editable = (0, _.getAttr)(match[0], 'editable');
        var key = (0, _.getAttr)(match[0], 'key');

        if (typeof editable === 'undefined' || editable === null || editable === '' || editable === 'false') {
          json[key] = json[_.config.source.name][key];
        }

        json = _.Hooks.instance.trigger('afterAddSourcePage', json, match[0]);
      }
    }
  }]);

  return Page;
}();

exports.default = Page;