import Handlebars from 'handlebars'
import fse from 'fs-extra'

import {
  Util,
  fileUtils,
  abeEngine,
  getAttr,
  escapeTextToRegex,
  config,
  Hooks,
  Manager
} from '../'

/**
 * Page class
 * manage HTML generation for page template
 */
export default class Page {

  /**
   * Create new page object
   * @param  {Object} params req.params from express route
   * @param  {Object} i18n translation
   * @param  {Function} callback 
   * @param  {Boolean} onlyHTML default = false, if true HTML content will contains abe attributes
   * @return {String} HTML page as string
   */
  constructor(templateId, template, json, onlyHTML = false) {
    
    var dateStart = new Date()

    // HOOKS beforePageJson
    json = Hooks.instance.trigger('beforePageJson', json)

    if( typeof Handlebars.templates[templateId] !== 'undefined' && 
        Handlebars.templates[templateId] !== null && 
        config.files.templates.precompile
      ){

      var template = Handlebars.templates[templateId];
      this.html = template(json, {data: {intl: config.intlData}})

      //console.log('precompile')

    } else {

      this._onlyHTML = onlyHTML
      this.template = template
      this.HbsTemplatePath = fileUtils.getTemplatePath('hbs/'+templateId+'.hbs')

      let util = new Util()

      abeEngine.instance.content = json
      
      // This pattern finds all abe tags which are not enclosed in a html tag attribute
      // it finds this one: <title>{{abe type='text' key='meta_title' desc='Meta title' tab='Meta' order='4000'}}</title>
      // it excludes this one: <meta name="description" content='{{abe type="text" key="meta_description" desc="Meta description" tab="Meta" order="4100"}}"/> 
      this.abePattern = /[^"']({{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g

      // This pattern finds all abe tags enclosed in a HTML tag attribute
      this.abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1}{{abe.*?}})/g

      // This pattern finds all {{#each ...}}...{{/each}} blocks
      this.eachBlockPattern = />\s*(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g

      // This pattern finds all {{#each ...}}...{{/each}} blocks
      this.blockPattern = /(\{\{#each.*\}\}[\s\S]*?\{\{\/each\}\})/g

      // Remove text with attribute "visible=false"
      this._removeHidden()
    
      if(!this._onlyHTML) {

        // Surrounds each Abe tag (which are text/rich/textarea and not in html attribute) with <abe> tag
        // ie. <title><abe>{{abe type='text' key='meta_title' desc='Meta title' tab='Meta' order='4000'}}</abe></title>
        this._encloseAbeTag()
      }

      // je rajoute les index pour chaque bloc lié à un each
      this._indexEachBlocks()
      
      if(!this._onlyHTML){

        // Je maj les attributs associés aux Abe qui sont dans des attributs de tag HTML
        this._updateAbeAsAttribute()

        // je rajoute les attributs pour les tags Abe (qui ne sont pas dans un attribut HTML)
        this._updateAbeAsTag()
      }
     
      this._addSource(json)

      // We remove the {{abe type=data ...}} from the text 
      this.template = Util.removeDataList(this.template)

      // It's time to replace the [index] by {{@index}} (concerning each blocks)
      this.template = this.template.replace(/\[index\]\./g, '{{@index}}-')

      // Let's persist the precompiled template for future use (kind of cache)
      fse.writeFileSync(this.HbsTemplatePath, Handlebars.precompile(this.template), 'utf8')
      Manager.instance.loadHbsTemplates()

      // I compile the text
      var compiledTemplate = Handlebars.compile((!this._onlyHTML) ? util.insertDebugtoolUtilities(this.template) : this.template)

      // I create the html page ! yeah !!!
      this.html = compiledTemplate(json, {data: {intl: config.intlData}})
    }

    if(this._onlyHTML) {
      this.html = Hooks.instance.trigger('afterPageSaveCompile', this.html, json)
    }else {
      this.html = Hooks.instance.trigger('afterPageEditorCompile', this.html, json)
    }

    //console.log('result: ' + ((new Date().getTime() - dateStart.getTime()) / 1000))
  }

  _updateAbeAsAttribute() {
    var match
    let util = new Util()

    while (match = this.abeAsAttributePattern.exec(this.template)) { // While regexp match {{attribut}}, ex: link, image ...
      if(util.isSingleAbe(match[0], this.template)){
        var more_attr = ''
        var getattr = getAttr(match, 'key').replace(/\./g, '-')
        this.template = this.template.replace(
          new RegExp(match[0]),
          ' data-abe-attr-' + util.validDataAbe(getattr) + '="'  + (match[0].split('=')[0]).trim() + '"' +
          ' data-abe-' + util.validDataAbe(getattr) + '="'  + getattr + '"' +
          more_attr + match[0].replace('}}', ' has-abe=1}}')
        )
      }
    }

    return this
  }

  _updateAbeAsTag() {
    var match
    let util = new Util()

    while (match = this.abePattern.exec(this.template)) {
      var getattr = getAttr(match, 'key').replace(/\./g, '-')
      this.template = this.template.replace(
        escapeTextToRegex(match[0], 'g'),
        ' data-abe-' + util.validDataAbe(getattr) + '="'  + getattr + '" ' + match[0]
      )
    }

    return this
  }
  
  /**
   * [_indexEachBlocks description]
   * @param  {[type]} text   [description]
   * @param  {[type]} blocks [description]
   * @return {[type]}        [description]
   */
  _indexEachBlocks() {
    // create an array of {{each}} blocks
    var blocks = this._splitEachBlocks()

    Array.prototype.forEach.call(blocks, (block) => {
      var key = block.match(/#each (.*)\}\}/)
      key = key[1]
      let util = new Util()
      var match

      if(!this._onlyHTML) {

        // je rajoute un data-able-block avec index sur tous les tags html du bloc each
        var textEachWithIndex = block.replace(/(<(?![\/])[A-Za-z0-9!-]*)/g, '$1 data-abe-block="' + key + '{{@index}}"')

        // je remplace le block dans le texte par ça
        this.template = this.template.replace(block, textEachWithIndex)
      }

      // Pour chaque tag Abe, je mets en forme ce tag avec des data- supplémentaires
      while (match = this.abePattern.exec(block)) {
        this._insertAbeEach(match, key, this.eachBlockPattern.lastIndex - block.length, util)
      }

      // Pour chaque tag Abe attribut de HTML, je mets en forme ce tag avec des data- supplémentaires sur le tag html parent
      while (match = this.abeAsAttributePattern.exec(block)) {
        this._insertAbeEach(match, key, this.eachBlockPattern.lastIndex - block.length, util)
      }  
    })

    return this
  }

  /**
   * create an array of {{#each}} blocks from the html document
   * @param  {String} html the html document
   * @return {Array}      the array of {{#each}} blocks
   */
  _splitEachBlocks() {
    var block
    var blocks = []

    while (block = this.blockPattern.exec(this.template)) {
      blocks.push(block[1])
    }

    return blocks
  }

  _insertAbeEach(theMatch, key, lastIndex, util) {
    var matchBlock = theMatch[0]
    if(util.isEachStatement(matchBlock)) return
    if(util.isBlockAbe(matchBlock)){
      var matchblockattr = (matchBlock.split('=')[0]).trim()
      var getattr = getAttr(matchBlock, 'key').replace('.', '[index].')
      var newMatchBlock = ((!this._onlyHTML) ?
                            (/=[\"\']\{\{(.*?)\}\}/g.test(matchBlock) ?
                                ' data-abe-attr-' + util.validDataAbe(getattr) + '="'  + matchblockattr + '"' :
                                '') +
                            ' data-abe-' + util.validDataAbe(getattr) + '="' + getattr + '" ' + matchBlock :
                            matchBlock)
          .replace(new RegExp('(key=[\'|"])' + key + '.', 'g'), '$1' + key + '[index].')
          .replace(/\{\{abe/, '{{abe dictionnary=\'' + key + '\'');

      this.template = this.template.replace(matchBlock, newMatchBlock)
    }

    return this
  }

  /**
   * add <abe> tag around html tag
   * @param {String} text html string
   */
  _removeHidden() {
    this.template = this.template.replace(/(\{\{abe.*visible=[\'|\"]false.*\}\})/g, '')

    return this
  }

  /**
   * add <abe> tag around html tag
   * @param {String} text html string
   */
  _encloseAbeTag() {
    var match
    while (match = this.abePattern.exec(this.template)) {
      this.template = this.template.replace(escapeTextToRegex(match[1], 'g'), '<abe>' + match[1].trim() + '</abe>')
    }

    return this
  }

  _addSource(json) {
    var listReg = /({{abe.*type=[\'|\"]data.*}})/g
    var match
    var limit = 0

    while (match = listReg.exec(this.template)) {
      var editable = getAttr(match[0], 'editable')
      var key = getAttr(match[0], 'key')

      if(typeof editable === 'undefined' || editable === null || editable === '' || editable === 'false') {
        json[key] = json[config.source.name][key]
      }

      json = Hooks.instance.trigger('afterAddSourcePage', json, match[0])
    }
  }
}