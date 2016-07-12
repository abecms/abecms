import express from 'express'
import Handlebars from 'handlebars'
import HandlebarsIntl from 'handlebars-intl'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'
import {minify} from 'html-minifier'
import fs from 'fs'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'

import {
  fileAttr
  ,Util
  ,printInput
  ,testObj
  ,notEmpty
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
  ,folders
  ,cleanTab
  ,printConfig
  ,translate
  ,getAttr
  ,getEnclosingTags
  ,escapeTextToRegex
  ,FileParser
  ,config
  ,cli
  ,log
  ,Hooks
  ,Plugins
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
  constructor(path, text, json, onlyHTML = false) {
    this._onlyHTML = onlyHTML

    // HOOKS beforePageText
    text = Hooks.instance.trigger('beforePageText', text, json, Handlebars)

    // HOOKS beforePageJson
    json = Hooks.instance.trigger('beforePageJson', json)

    Handlebars.registerHelper('abe', compileAbe) // HandlebarsJS unique text helper
    Handlebars.registerHelper('i18nAbe', translate) // HandlebarsJS unique text helper
    Handlebars.registerHelper('math', math) // HandlebarsJS unique text helper
    Handlebars.registerHelper('moduloIf', moduloIf) // HandlebarsJS helper for modulo test
    Handlebars.registerHelper('testObj', testObj) // 
    Handlebars.registerHelper('attrAbe', attrAbe) // 
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
    let intlData = config.intlData

    text = this._removeHidden(text)
    text = this._addAbeTag(text)

    abeEngine.instance.content = json

    // var pattNode = />({{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g,
    var pattNode = /((?!"{{abe[\S\s]*?}}).{{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g,
        pattAttr = /( [A-Za-z0-9\-\_]+="*{{abe.*?}})/g,
        pattSpeAttr = /=[\'|\"]{{abe.*}}[\'|\"]/g,
        pattEach = />\s*(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g,
        arrayEach = [],
        match,
        textEach,
        textSpeAttr

    function contains(arr, obj) {
      var i = arr.length;
      while (i--) {
          if (arr[i] === obj) {
              return true;
          }
      }
      return false;
    }

    var open = []

    function recurseSplit(str, c) {
      var splitEachs = text.split('{{#each ')
      var c = 0;
      // var cc = 0;
      var resStr = ''
      resStr += splitEachs.shift()
      Array.prototype.forEach.call(splitEachs, (splitEach) => {
        var splitEachStr = '{{#each-' + c + ' ' + splitEach
        open.push(c)
        var splitEachsClose = splitEachStr.split('{{/each')
        resStr += splitEachsClose.shift()
        
        Array.prototype.forEach.call(splitEachsClose, (splitEachClose) => {
          var i = open.pop()
          resStr += '{{/each-' + i + splitEachClose
        })

        c += 1
      })

      return resStr
    }
    var res = recurseSplit(text , 0)

    var textCountEach,
        pattCountEach = /\{\{#(each-.)/g,
        eaches = []

    while (textCountEach = pattCountEach.exec(res)) {
      var ar = res.split('{{#' + textCountEach[1])
      var start = '{{#each' + ar[1]
      var arr = start.split('{{/' + textCountEach[1] + '}}')
      var end = arr[0] + '{{/each}}'

      end = end.replace(/(each-.)/g, 'each')
      eaches.push(end)
    }

    Array.prototype.forEach.call(eaches, (eache) => {
      var keyArray = eache.match(/#each (\n|.)*?\}/)
      keyArray = keyArray[0].slice(6, keyArray[0].length - 1)
      var dataBlock = eache //.replace(/(>\s*\{\{#each (\n|.)*?\}\})/, '').replace('{{/each}}', '')
      if(!this._onlyHTML) {
        var meta = config.meta.name
        var test = dataBlock.replace(/{{abe(.*?)}}/g, '[[abe$1]]').replace(new RegExp(`\\.\\.\/${meta}`, 'g'), meta)
        var json2 = JSON.parse(JSON.stringify(json))
        var keys = dataBlock.match(new RegExp(`${keyArray}\.([A-Za-z0-9\-\_]+)`, 'g'))
        if(keys && (typeof json2[keyArray] === 'undefined' || json2[keyArray] === null)){
          var obj = {}
          keys.forEach(function (key) {
            obj[key.replace(`${keyArray}.`, '')] = ""
          })
          json2[keyArray] = []
          json2[keyArray].push(obj)
        }
        var jsonOne = {}
        jsonOne[keyArray] = [{}]
        var template = Handlebars.compile(dataBlock.replace(/{{abe(.*?)}}/g, '[[abe$1]]').replace(new RegExp(`\\.\\.\/${meta}`, 'g'), meta))
        var insertCompiled = template(json2, {data: {intl: intlData}}).replace(/\[\[abe(.*?)\]\]/g, '{{abe$1}}')
        var insertCompiledEmpty = template(jsonOne, {data: {intl: intlData}}).replace(/\[\[abe(.*?)\]\]/g, '{{abe$1}}')
        var textEachWithIndex = eache.replace(/(<(?![\/])[A-Za-z0-9!-]*)/g, '$1 data-abe-block="' + keyArray + '{{@index}}"')

        text = text.replace(eache, textEachWithIndex + `<!-- [[${keyArray}]] ${util.encodeAbe(insertCompiledEmpty)} -->`)
      }
      while (match = pattNode.exec(eache)) {
        text = this._insertAbeEach(text, match, keyArray, pattEach.lastIndex - eache.length, util, util)
      }
      while (match = pattAttr.exec(eache)) {
        text = this._insertAbeEach(text, match, keyArray, pattEach.lastIndex - eache.length, util, util)
      }
    
    })
    var matches = [];
    while (match = pattNode.exec(text)) {
      if(matches.indexOf(match[0]) === -1) {
        matches.push(match[0])
      }
    }
    Array.prototype.forEach.call(matches, (match) => {
      text = this._abeFunc(text, match)
      if(!this._onlyHTML){
        var getattr = getAttr(match, 'key').replace(/\./g, '-')
        text = text.replace(
          escapeTextToRegex(match, 'g'),
          ' data-abe-' + util.validDataAbe(getattr) + '="'  + getattr + '" ' + match
        )
      }
    })
    while (match = pattAttr.exec(text)) { // While regexp match {{attribut}}, ex: link, image ...
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

    var source = config.source.name
    if(!this._onlyHTML && typeof json[source] !== 'undefined' && json[source] !== null) {
      var keys = Object.keys(json[source])
      
      for(var i in keys) {
        var replaceEach = new RegExp(`<!-- \\[\\[${keys[i]}\\]\\][\\s\\S]*?-->`, 'g')
        text = text.replace(replaceEach, '')

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

        // text = text.replace(
        //   new RegExp('{{(' + keys[i] + ')}}(?=(?:[^"]*"[^"]*")*[^"]*$)', 'g'),
        //   `<abe data-abe="$1" >{{$1}}</abe>`
        //   )
        var eachSource = new RegExp(`({{#each ${keys[i]}}[\\s\\S a-z]*?{{\/each}})`, 'g')
        var matches = text.match(eachSource)
        if(typeof matches !== 'undefined' && matches !== null) {
          
          Array.prototype.forEach.call(matches, (match) => {
            if(!this._onlyHTML) {
              text = text.replace(match, `${match}<!-- [[${keys[i]}]] ${util.encodeAbe(match)} -->`)
            }
          })
        }
      }
    }

    this._addSource(text, json)
    text = Util.removeDataList(text)

    text = text.replace(/\[index\]\./g, '{{@index}}-')
    if(typeof text !== "undefined" && text !== null && typeof text.replace === "function"){
      // HOOKS afterPageText
      text = Hooks.instance.trigger('afterPageText', text, json, Handlebars)

      // HOOKS afterPageJson
      json = Hooks.instance.trigger('afterPageJson', json)

      var template = Handlebars.compile((!this._onlyHTML) ? util.insertDebugtoolUtilities(text) : text)

      var tmp = template(json, {
          data: {intl: intlData}
      })
      
      if(this._onlyHTML) {
        tmp = Hooks.instance.trigger('afterPageSaveCompile', tmp, json)
      }else {
        tmp = Hooks.instance.trigger('afterPageEditorCompile', tmp, json)
      }

      this.html = tmp
    }
  }

  _insertAbeEach(text, theMatch, keyArray, lastIndex, util) {
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
          .replace(new RegExp('(key=[\'|"])' + keyArray + '.', 'g'), '$1' + keyArray + '[index].')
          .replace(/\{\{abe/, '{{abe dictionnary=\'' + keyArray + '\'');

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
  _addAbeTag(text) {
    // if 2 abe tag following each other add a space between them
    text = text.replace(/\}\}\{\{abe/g, '}} {{abe')
    text = text.replace(/>\{\{/g, '> {{')
    var pattTag = /((?!"{{abe[\S\s]*?}}).{{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g

    if(!this._onlyHTML) {
      var match
      while (match = pattTag.exec(text)) {
        text = text.replace(escapeTextToRegex(match[1], 'g'), ' <abe>' + match[1].trim() + '</abe>')
        text = text.replace(/<abe> <abe>/g, '<abe>')
        text = text.replace(/<\/abe><\/abe>/g, '</abe>')
      }
    }
    text = text.replace(/> \{\{/g, '>{{')

    return text
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
  _abeClear(text, key, tag, match) {
    var hideTagRegex
    var hideHtmls = getEnclosingTags(text, match, tag)

    Array.prototype.forEach.call(hideHtmls, (hideHtml) => {
      if(this._onlyHTML) {
        hideTagRegex = escapeTextToRegex(hideHtml, 'gm')
        text = text.replace(hideTagRegex, '{{#if ' + key + '}}' + hideHtml + '{{/if}}')
      }else {
        var firstTag = /(<[^\s>]+)/.exec(hideHtml)
        firstTag = firstTag[0]

        var hideHtmlWithAttr = hideHtml.replace(firstTag, firstTag + ' data-if-empty-clear="' + key + '"')
        text = text.replace(escapeTextToRegex(hideHtml, 'g'), hideHtmlWithAttr)
      }
    })
    
    return text
  }

  _addSource(text, json) {
    var listReg = /({{abe.*type=[\'|\"]data.*}})/g,
        match,
        limit = 0

    while (match = listReg.exec(text)) {
      var type = 'text'
      , paginate = getAttr(match[0], 'paginate')
      , editable = getAttr(match[0], 'editable')
      , key = getAttr(match[0], 'key')
      , display = getAttr(match[0], 'display')
      , desc = getAttr(match[0], 'desc')
      , maxLength = getAttr(match[0], 'max-length')
      , tab = getAttr(match[0], 'tab')

      editable = (typeof editable === 'undefined' || editable === null || editable === '' || editable === 'false') ? false : true

      var eachSource = new RegExp(`{{#each ${key}}`)
      maxLength = (eachSource.test(text)) ? maxLength : 1
      var source = config.source.name

      if(!editable) {
        json[key] = json[source][key]
      }

      if(paginate !== '' && typeof json[key] !== 'undefined' && json[key] !== null) {
        paginate = parseInt(paginate)
        json[key] = json[key].slice(0, parseInt(paginate))
      }
      json = Hooks.instance.trigger('afterAddSourcePage', json, match[0])
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
  _abeFunc(text, match) {
    var ifEmpty = getAttr(match, 'if-empty')
    var key = getAttr(match, 'key')

    if(ifEmpty !== '') {
      var tag = /\(([^)]+)\)/g.exec(ifEmpty)
      var func = /([^)]+)\(/g.exec(ifEmpty)

      if(typeof func[1] !== 'undefined' && func[1] !== null) {
        switch(func[1]) {
          case 'clear':
            if(typeof tag[1] !== 'undefined' && tag[1] !== null) {
              text = this._abeClear(text, key, tag[1], match)
            }
            break;
        }
      }
    }

    return text
  }
}