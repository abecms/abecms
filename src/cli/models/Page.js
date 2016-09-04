import Handlebars from 'handlebars'
import HandlebarsIntl from 'handlebars-intl'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'
import fse from 'fs-extra'
import hbtemplate from '/Users/grg/programmation/git/abejs/grg.js'

import {
  Util
  ,testObj
  ,printJson
  ,printBlock
  ,className
  ,moduloIf
  ,abeEngine
  ,compileAbe
  ,listPage
  ,abeImport
  ,ifIn
  ,ifCond
  ,math
  ,attrAbe
  ,cleanTab
  ,printConfig
  ,translate
  ,getAttr
  ,escapeTextToRegex
  ,config
  ,Hooks
} from '../'

/**
 * Page class
 * manage HTML generation for page template
 */
export default class Page {

  /**
   * Create new page object
   * @param  {Object} params req.params from express route
   * @param  {Object} i18n tranduction
   * @param  {Function} callback 
   * @param  {Boolean} onlyHTML default = false, if true HTML content will contains abe attributs
   * @return {String} HTML page as string
   */
  
  _constructor(path, text, json, onlyHTML = false) {
    var dateStart = new Date()
    if(typeof text !== "undefined" && text !== null && typeof text.replace === "function"){
      // HOOKS afterPageText
      text = Hooks.instance.trigger('afterPageText', text, json, Handlebars)

      // HOOKS afterPageJson
      json = Hooks.instance.trigger('afterPageJson', json)

      //var template = fse.readJsonSync('/Users/grg/programmation/git/abejs/grg.hbs')
      var template = Handlebars.templates['grg'];

      var tmp = template(json, {
          data: {intl: config.intlData}
      })
      
      if(this._onlyHTML) {
        tmp = Hooks.instance.trigger('afterPageSaveCompile', tmp, json)
      }else {
        tmp = Hooks.instance.trigger('afterPageEditorCompile', tmp, json)
      }

      this.html = tmp
    }
    console.log('hbs: ' + ((new Date().getTime() - dateStart.getTime()) / 1000))
  }

  constructor(path, text, json, onlyHTML = false) {
    var dateStart = new Date()
    this._onlyHTML = onlyHTML

    // HOOKS beforePageText
    text = Hooks.instance.trigger('beforePageText', text, json, Handlebars)

    // HOOKS beforePageJson
    json = Hooks.instance.trigger('beforePageJson', json)

    Handlebars.registerHelper('abe', compileAbe)
    Handlebars.registerHelper('i18nAbe', translate)
    Handlebars.registerHelper('math', math)
    Handlebars.registerHelper('moduloIf', moduloIf)
    Handlebars.registerHelper('testObj', testObj)
    Handlebars.registerHelper('attrAbe', attrAbe) 
    Handlebars.registerHelper('printJson', printJson)
    Handlebars.registerHelper('printBlock', printBlock)
    Handlebars.registerHelper('className', className)
    Handlebars.registerHelper('cleanTab', cleanTab)
    Handlebars.registerHelper('slugify', handlebarsHelperSlugify({Handlebars: Handlebars}).slugify)
    Handlebars.registerHelper('printConfig', printConfig)
    Handlebars.registerHelper('ifIn', ifIn)
    Handlebars.registerHelper('ifCond', ifCond)
    Handlebars.registerHelper('abeImport', abeImport)
    Handlebars.registerHelper('listPage', listPage)
    HandlebarsIntl.registerWith(Handlebars)

    Hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)

    let util = new Util()

    abeEngine.instance.content = json

    //this.abePattern = /((?!"{{abe[\S\s]*?}}).{{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g
    
    // This pattern finds all abe tags which are not enclosed in a html tag attribute
    // it finds this one: <title>{{abe type='text' key='meta_title' desc='Meta title' tab='Meta' order='4000'}}</title>
    // it excludes this one: <meta name="description" content='{{abe type="text" key="meta_description" desc="Meta description" tab="Meta" order="4100"}}"/> 
    this.abePattern = /[^"']({{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g
    this.abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1}{{abe.*?}})/g
    this.eachBlockPattern = />\s*(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g
    var match

    // Remove text with attribute "visible=false"
    text = this._removeHidden(text)

    // Surrounds each Abe tag (which are text/rich/textarea and not in html attribute) with <abe> tag
    // ie. <title><abe>{{abe type='text' key='meta_title' desc='Meta title' tab='Meta' order='4000'}}</abe></title>
    text = this._encloseAbeTag(text)

    // je rajoute les index pour chaque bloc lié à un each
    text = this._indexEachBlocks(text)

    // je rajoute les attributs pour les tags Abe (qui ne sont pas dans un attribut HTML)
    text = this._updateAbeAsTag(text)

    // Je maj les attributs associés aux Abe qui sont dans des attributs de tag HTML
    text = this._updateAbeAsAttribute(text)


    /* ce pattern ne peut rien trouver : ' ([A-Za-z0-9\-\_]+)=["|\'].*?({{' + keys[i] + '}}).*?["|\']'
    // {{hotel_list}} ne peut pas exister tel quel ?
    var source = config.source.name
    if(!this._onlyHTML && typeof json[source] !== 'undefined' && json[source] !== null) {
      var keys = Object.keys(json[source])
      
      for(var i in keys) {
        var patAttrSource = new RegExp(' ([A-Za-z0-9\-\_]+)=["|\'].*?({{' + keys[i] + '}}).*?["|\']', 'g')
        var patAttrSourceMatch = text.match(patAttrSource)

        if(typeof patAttrSourceMatch !== 'undefined' && patAttrSourceMatch !== null) {
          var patAttrSourceInside = new RegExp('(\\S+)=["\']?((?:.(?!["\']?\\s+(?:\\S+)=|[>"\']))+.)["\']?({{' + keys[i] + '}}).*?["|\']', 'g')
          Array.prototype.forEach.call(patAttrSourceMatch, (pat) => {
            var patAttrSourceCheck = patAttrSourceInside.exec(pat)
            if(typeof patAttrSourceCheck !== 'undefined' && patAttrSourceCheck !== null) {
              var checkEscaped = /["|'](.*?)["|']/
              checkEscaped = checkEscaped.exec(patAttrSourceCheck[0])
              if(typeof checkEscaped !== 'undefined' && checkEscaped !== null && checkEscaped.length > 0) {
                checkEscaped = escape(checkEscaped[1])
                text = text.replace(
                  patAttrSourceCheck[0],
                  ` data-abe-attr="${patAttrSourceCheck[1]}" data-abe-attr-escaped="${checkEscaped}" data-abe="${keys[i]}" ${patAttrSourceCheck[0]}`
                )
              }
            }
          })
        }
      }
    }
    */
   
    this._addSource(text, json)

    // We remove the {{abe type=data ...}} from the text 
    text = Util.removeDataList(text)

    // It's time to replace the [index] by {{@index}} (concerning each blocks)
    text = text.replace(/\[index\]\./g, '{{@index}}-')


    if(typeof text !== "undefined" && text !== null && typeof text.replace === "function"){
      // HOOKS afterPageText
      text = Hooks.instance.trigger('afterPageText', text, json, Handlebars)

      // HOOKS afterPageJson
      json = Hooks.instance.trigger('afterPageJson', json)

      // I compile the text
      var template = Handlebars.compile((!this._onlyHTML) ? util.insertDebugtoolUtilities(text) : text)

      //var template = fse.readJsonSync('/Users/grg/programmation/git/abejs/grg.hbs')
      fse.writeFileSync('/Users/grg/programmation/git/abejs/grg.hbs', Handlebars.precompile(text))
      // I create the html page ! yeah !!!
      var tmp = template(json, {
          data: {intl: config.intlData}
      })
      
      if(this._onlyHTML) {
        tmp = Hooks.instance.trigger('afterPageSaveCompile', tmp, json)
      }else {
        tmp = Hooks.instance.trigger('afterPageEditorCompile', tmp, json)
      }

      this.html = tmp
    }
    console.log('roots: ' + ((new Date().getTime() - dateStart.getTime()) / 1000))
  }

  _updateAbeAsAttribute(text) {
    var match
    let util = new Util()

    while (match = this.abeAsAttributePattern.exec(text)) { // While regexp match {{attribut}}, ex: link, image ...
      if(util.isSingleAbe(match[0], text)){
        var more_attr = ''
        if(!this._onlyHTML){
          var getattr = getAttr(match, 'key').replace(/\./g, '-')
          text = text.replace(
            new RegExp(match[0]),
            ' data-abe-attr-' + util.validDataAbe(getattr) + '="'  + (match[0].split('=')[0]).trim() + '"' +
            ' data-abe-' + util.validDataAbe(getattr) + '="'  + getattr + '"' +
            more_attr + match[0].replace('}}', ' has-abe=1}}')
          )
        }
      }
    }

    return text
  }

  _updateAbeAsTag(text) {
    var match
    let util = new Util()

    while (match = this.abePattern.exec(text)) {
      if(!this._onlyHTML){
        var getattr = getAttr(match, 'key').replace(/\./g, '-')
        text = text.replace(
          escapeTextToRegex(match[0], 'g'),
          ' data-abe-' + util.validDataAbe(getattr) + '="'  + getattr + '" ' + match[0]
        )
      }
    }

    return text
  }
  
  /**
   * [_indexEachBlocks description]
   * @param  {[type]} text   [description]
   * @param  {[type]} blocks [description]
   * @return {[type]}        [description]
   */
  _indexEachBlocks(text) {
    // create an array of {{each}} blocks
    var blocks = this._splitEachBlocks(text)

    Array.prototype.forEach.call(blocks, (block) => {
      var key = block.match(/#each (.*)\}\}/)
      key = key[1]
      let util = new Util()
      var match

      if(!this._onlyHTML) {

        // je rajoute un data-able-block avec index sur tous les tags html du bloc each
        var textEachWithIndex = block.replace(/(<(?![\/])[A-Za-z0-9!-]*)/g, '$1 data-abe-block="' + key + '{{@index}}"')

        // je remplace le block dans le texte par ça
        text = text.replace(block, textEachWithIndex)
      }

      // Pour chaque tag Abe, je mets en forme ce tag avec des data- supplémentaires
      while (match = this.abePattern.exec(block)) {
        text = this._insertAbeEach(text, match, key, this.eachBlockPattern.lastIndex - block.length, util)
      }

      // Pour chaque tag Abe attribut de HTML, je mets en forme ce tag avec des data- supplémentaires sur le tag html parent
      while (match = this.abeAsAttributePattern.exec(block)) {
        text = this._insertAbeEach(text, match, key, this.eachBlockPattern.lastIndex - block.length, util)
      }  
    })

    return text
  }

  /**
   * create an array of {{#each}} blocks from the html document
   * @param  {String} html the html document
   * @return {Array}      the array of {{#each}} blocks
   */
  _splitEachBlocks(html) {
    var blockPattern = /(\{\{#each.*\}\}[\s\S]*?\{\{\/each\}\})/g
    var block
    var blocks = []

    while (block = blockPattern.exec(html)) {
      blocks.push(block[1])
    }

    return blocks
  }

  _insertAbeEach(text, theMatch, key, lastIndex, util) {
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

      text = text.replace(matchBlock, newMatchBlock)
    }

    return text
  }

  /**
   * add <abe> tag around html tag
   * @param {String} text html string
   */
  _removeHidden(text) {
    return text.replace(/(\{\{abe.*visible=[\'|\"]false.*\}\})/g, '')
  }

  /**
   * add <abe> tag around html tag
   * @param {String} text html string
   */
  _encloseAbeTag(text) {
    if(!this._onlyHTML) {
      var match
      while (match = this.abePattern.exec(text)) {
        text = text.replace(escapeTextToRegex(match[1], 'g'), ' <abe>' + match[1].trim() + '</abe>')
        text = text.replace(/<abe> <abe>/g, '<abe>')
        text = text.replace(/<\/abe><\/abe>/g, '</abe>')
      }
    }

    return text
  }

  _addSource(text, json) {
    var listReg = /({{abe.*type=[\'|\"]data.*}})/g
    var match
    var limit = 0

    while (match = listReg.exec(text)) {
      var editable = getAttr(match[0], 'editable')
      var key = getAttr(match[0], 'key')

      if(typeof editable === 'undefined' || editable === null || editable === '' || editable === 'false') {
        json[key] = json[config.source.name][key]
      }

      json = Hooks.instance.trigger('afterAddSourcePage', json, match[0])
    }
  }
}