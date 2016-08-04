import extend from 'extend'
import loremIpsum from 'lorem-ipsum'
import clc from 'cli-color'
import fse from 'fs-extra'
import ajaxRequest from 'ajax-request'
import {Promise} from 'es6-promise'
import http from 'http' 
import https from 'https'

import {
  config
  ,cli
  ,log
  ,Sql
  ,folderUtils
  ,fileUtils
  ,FileParser
  ,fileAttr
  ,dateSlug
  ,dateUnslug
  ,escapeTextToRegex
  ,getAttr
  ,Hooks
  ,Plugins
} from '../'

export default class Utils {

  constructor() {
    this._form = {
      
    }
    this._key = []
  }

  /**
   * Get all input from a template
   * @return {Array} array of input form
   */
  get form(){
    return this._form
  }

  /**
   * Check if key is not is the form array
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  dontHaveKey(key){
    return typeof this._key[key] === "undefined" || this._key[key] === null
  }

  /**
   * Add entry to abe engine form
   * @param {String} type        textarea | text | meta | link | image | ...
   * @param {String} key         unique ID, no space allowed
   * @param {String} desc        input description
   * @param {Int}    maxLength   maximum characteres allowed inside input
   * @param {String} tab         tab name
   * @param {String} jsonValue   
   * @return {Void}
   */
  add(obj) {
    var defaultValues = {
        type: 'text',
        key: '',
        desc: '',
        maxLength: null,
        tab: 'default',
        placeholder: '',
        value: '',
        source: null,
        display: null,
        reload: false,
        order: 0,
        required: false,
        editable: true,
        visible: true,
        block: ''
      }

    obj = extend(true, defaultValues, obj)
    obj.tab = (typeof obj.tab !== 'undefined' && obj.tab !== null && obj.tab !== '') ? obj.tab : 'default'

    obj.reload = (typeof obj.reload !== 'undefined' && obj.reload !== null && obj.reload === 'true') ? true : false,
    obj.key = obj.key.replace(/\./, '-')

    if(obj.key.indexOf('[') < 0 && obj.key.indexOf('.') > -1) {
      obj.block = obj.key.split('.')[0]
    }

    if(typeof this._form[obj.tab] === 'undefined' || this._form[obj.tab] === null) this._form[obj.tab] = {item:[]}

    this._key[obj.key] = true // save key for dontHaveKey()
    this._form[obj.tab].item.push(obj)
  }

  isBlock(str){
    return str.indexOf('[') < 0 && str.indexOf('.') > 0
  }

  /**
   * Test if a string don't contains string key from ABE block statement
   * @param  {String}  str string to test
   * @return {Boolean} true = this is not a block content
   */
  isSingleAbe(str, text){
    return  !new RegExp('#each(.)+?' + getAttr(str, 'key').split('.')[0]).test(text) &&
            str.indexOf('{{#') < 0 &&
            str.indexOf('#each') < 0 &&
            str.indexOf('{{/') < 0 &&
            str.indexOf('/each') < 0 &&
            str.indexOf('attrAbe') < 0
  }

  /**
   * Test if a string contains string key from ABE block statement
   * @param  {String}  str string to test
   * @return {Boolean} true = this is a block content
   */
  isBlockAbe(str) {
    return str.indexOf('abe') > -1 && getAttr(str, 'key').indexOf('.') > -1
  }

  /**
   * Test if a string contains string key from {{#each}} block statement
   * @param  {String}  str string to test
   * @return {Boolean} true = this is a block content
   */
  isEachStatement(str) {
    return str.indexOf('#each') > -1 || str.indexOf('/each') > -1
  }

  /**
   * Encode / Escape && add data-abe attributs
   * @param  {String} block
   * @return {String} escaped string
   */
  encodeAbe(block){
    var matchAbe = block.match(/>\s*\{\{abe .*\}\}/g)
    if(matchAbe){
      for (var i = 0; i < matchAbe.length; i++){
        var getattr = getAttr(matchAbe[i], 'key').replace('.', '[0]-')
        block = block.replace(
          matchAbe[i],
          ' data-abe-' + this.validDataAbe(getattr) + '="'  + getattr + '" >'
        )
      }
    }
    matchAbe = block.match(/( [A-Za-z0-9\-\_]+="*{{.*?}})/g)
    if(matchAbe){
      for (var i = 0; i < matchAbe.length; i++) {
          if(typeof matchAbe !== 'undefined' && matchAbe !== null){
            var getattr = getAttr(matchAbe[i], 'key').replace('.', '[0]-')
            var matchattr = (matchAbe[i].split('=')[0]).trim()
            block = block.replace(
              matchAbe[i],
              ' data-abe-attr-' + this.validDataAbe(getattr) + '="'  + matchattr + '"' +
              ' data-abe-' + this.validDataAbe(getattr) + '="'  + getattr + '" ' + matchAbe[i]
            )
            .replace(/\{\{\abe.*?}\}/, '')
          }
        }
    }
    return escape(block)
  }

  /**
   * Add some stuff like style / script before closing </body> tag
   * @param  {String} text html page
   * @return {String} text + some sugar stuff added on the fly
   */
  insertDebugtoolUtilities(text){
    return text.replace(
      /<\/body>/,
        `<style>
          body [data-abe]{ transition: box-shadow 600ms ease-in-out; box-shadow: 0; }
          body .select-border{ border-color: #007CDE; box-shadow: 0 3px 13px #7CBAEF; }
          body img.display-attr:before { content: attr(alt); }
          body a.display-attr:before { content: attr(title); }
          body .display-attr:before { position: absolute; display: block; z-index: 555; font-size: 10px; background-color: rgba(255, 255, 255, 0.75); padding: 2px 5px; color: #5D5D5D; }
          .hidden-abe{ display: none!important; width: 0px !important; height: 0px!important; position: absolute; left: -10000px; top: -10000px; visibility: hidden;}
        </style>
      </body>`
    )
  }

  validDataAbe(str){
    return str.replace(/\[([0-9]*)\]/g, '$1')
  }

  lorem(type, v) {
    var lorem = ''
    if(type === 'text') {
      lorem = loremIpsum({
        units: 'sentences' // Generate words, sentences, or paragraphs.
        , sentenceLowerBound: 5
        , sentenceUpperBound: 10
      })
    }else if(type === 'link') {
      lorem = 'http://www.google.com'
    }else if(type === 'image' || type === 'file') {
      var width = getAttr(v, 'width')
      width = (width !== '') ? width : 300
      var height = getAttr(v, 'height')
      height = (height !== '') ? height : 300
      lorem = `http://placehold.it/${height}x${width}`
    }else if(type === 'textarea' || type === 'rich') {
      lorem = loremIpsum({
        units: 'paragraphs' // Generate words, sentences, or paragraphs.
        , paragraphLowerBound: 3
        , paragraphUpperBound: 7
      })
    }
    return lorem
  }

  static escapeRegExp(str) {
    var specials = [
      // order matters for these
      "-"
      , "["
      , "]"
      // order doesn't matter for any of these
      , "/"
      , "{"
      , "}"
      , "("
      , ")"
      , "*"
      , "+"
      , "?"
      , "."
      , "\\"
      , "^"
      , "$"
      , "|"
    ]

    // I choose to escape every character with '\'
    // even though only some strictly require it when inside of []
    , regex = RegExp('[' + specials.join('\\') + ']', 'g')
    return str.replace(regex, "\\$&");
  }

  static addMetas(tpl, json, type, obj = {}, date = null, realType = 'draft') {
    let meta = config.meta.name

    json[meta] = extend({}, json[meta])
    var currentDate = (typeof date !== 'undefined' && date !== null && date !== '') ? date : new Date()
    var abeUrl = (type === 'publish') ? json[meta].link : fileAttr.add(json[meta].link, 'd' + dateSlug(currentDate.toISOString())) + ''

    if(typeof json[meta].date === 'undefined' || json[meta].date === null) {
      json[meta].date = currentDate
    }
    json[meta].latest = {
      date: currentDate,
      abeUrl: abeUrl
    }
    json[meta].status = realType === 'reject' ? 'draft' : realType
    if(typeof json[meta][type] === 'undefined' || json[meta][type] === null) {
      json[meta][type] = JSON.parse(JSON.stringify(obj))
      json[meta][type].date = currentDate
      json[meta][type].abeUrl = abeUrl
    }
    json[meta][type].latest = JSON.parse(JSON.stringify(obj))
    json[meta][type].latest.date = currentDate
    json[meta][type].latest.abeUrl = abeUrl
  }

  static getDataList(tplPath, text, jsonPage) {

    var p = new Promise((resolve, reject) => {
      var listReg = /({{abe.*type=[\'|\"]data.*}})/g,
          match

      var sourceAttr = config.source.name
      if(typeof jsonPage[sourceAttr] === 'undefined' || jsonPage[sourceAttr] === null) {
        jsonPage[sourceAttr] = {}
      }

      var promises = []
      while (match = listReg.exec(text)) {
        var logTime = tplPath + " > " + match[0]
        var dateStart = new Date()

        var pSource = new Promise((resolveSource, rejectSource) => {
          var obj = Utils.getAllAttributes(match[0], jsonPage)

          // var source = getAttr(match[0], 'source')
          // var key = getAttr(match[0], 'key')
          // var editable = getAttr(match[0], 'editable')
          // var paginate = getAttr(match[0], 'paginate')
          // editable = (typeof editable === 'undefined' || editable === null || editable === '' || editable === 'false') ? false : true

          if(typeof obj.sourceString !== 'undefined' && obj.sourceString !== null && obj.sourceString.indexOf('{{') > -1) {
            var matches = obj.sourceString.match(/({{[a-zA-Z._]+}})/g)
            if(matches !== null) {
              Array.prototype.forEach.call(matches, (match) => {
                var val = match.replace('{{', '')
                val = val.replace('}}', '')
                val = Sql.deep_value_array(jsonPage, val)
                if(typeof val === 'undefined' || val === null) {
                  val = ''
                }
                obj.sourceString = obj.sourceString.replace(match, val)
              })
            }
          }
          var type = Sql.getSourceType(obj.sourceString)
          switch (type) {
            case 'request':

              var data = Sql.getDataRequest(tplPath, match[0], jsonPage)
              jsonPage[sourceAttr][obj.key] = data
              if (!obj.editable) {
                if (obj.maxLength) {
                  jsonPage[obj.key] = data.slice(0, obj.maxLength)
                }else {
                  jsonPage[obj.key] = data
                }
              }else if (obj.prefill && (typeof jsonPage[obj.key] === 'undefined' || jsonPage[obj.key] === null || jsonPage[obj.key] === '')) {
                if (obj.prefillQuantity && obj.maxLength) {
                  jsonPage[obj.key] = data.slice(0, (obj.prefillQuantity > obj.maxLength) ? obj.maxLength : obj.prefillQuantity)
                }else if (obj.prefillQuantity) {
                  jsonPage[obj.key] = data.slice(0, obj.prefillQuantity)
                }else if (obj.maxLength) {
                  jsonPage[obj.key] = data.slice(0, obj.maxLength)
                }else {
                  jsonPage[obj.key] = data
                }
              }

              if(typeof obj.paginate !== 'undefined' && obj.paginate !== null && obj.paginate !== '') {
                obj.paginate = parseInt(obj.paginate)
                if(typeof jsonPage.abe_meta.paginate === 'undefined' || jsonPage.abe_meta.paginate === null) {
                  jsonPage.abe_meta.paginate = {}
                }
                if(typeof jsonPage.abe_meta.paginate[obj.key] === 'undefined' || jsonPage.abe_meta.paginate[obj.key] === null) {
                  jsonPage.abe_meta.paginate[obj.key] = {}
                }

                var linksSize = Math.ceil(data.length / obj.paginate)

                if (linksSize > 0) {
                  jsonPage.abe_meta.paginate[obj.key].size = obj.paginate
                  jsonPage.abe_meta.paginate[obj.key].current = 1
                  jsonPage.abe_meta.paginate[obj.key].links = []

                  if(typeof jsonPage.abe_meta.paginate[obj.key].prev !== 'undefined' && jsonPage.abe_meta.paginate[obj.key].prev !== null) {
                    delete jsonPage.abe_meta.paginate[obj.key].prev
                  }
                  if(typeof jsonPage.abe_meta.paginate[obj.key].first === 'undefined' || jsonPage.abe_meta.paginate[obj.key].first === null) {
                    jsonPage.abe_meta.paginate[obj.key].first = jsonPage.abe_meta.link
                  }
                  for (var i = 0; i <= linksSize; i++) {
                    var link = jsonPage.abe_meta.link
                    if (i > 0) {
                      link = fileUtils.removeExtension(link) + '-' + (i + 1) + '.' + config.files.templates.extension
                    }
                    jsonPage.abe_meta.paginate[obj.key].links.push({
                      link: link,
                      index: (i + 1)
                    })
                  }
                  if((typeof jsonPage.abe_meta.paginate[obj.key].next === 'undefined' || jsonPage.abe_meta.paginate[obj.key].next === null)
                    && (typeof jsonPage.abe_meta.paginate[obj.key].links[1] !== 'undefined' && jsonPage.abe_meta.paginate[obj.key].links[1] !== null)
                    && (typeof jsonPage.abe_meta.paginate[obj.key].links[1].link !== 'undefined' && jsonPage.abe_meta.paginate[obj.key].links[1].link !== null)) {
                    jsonPage.abe_meta.paginate[obj.key].next = jsonPage.abe_meta.paginate[obj.key].links[1].link
                  }
                  jsonPage.abe_meta.paginate[obj.key].last = jsonPage.abe_meta.paginate[obj.key].links[jsonPage.abe_meta.paginate[obj.key].links.length-1].link
                }
                jsonPage = Hooks.instance.trigger('beforePaginateEditor', jsonPage, obj)
              }

              if(typeof jsonPage[obj.key] !== 'undefined' && jsonPage[obj.key] !== null) {
                var newJsonValue = []
                Array.prototype.forEach.call(jsonPage[obj.key], (oldValue) => {
                  Array.prototype.forEach.call(jsonPage[sourceAttr][obj.key], (newValue) => {
                    if(typeof oldValue[config.meta.name] !== 'undefined' && oldValue[config.meta.name] !== null
                      && oldValue[config.meta.name].link === newValue[config.meta.name].link) {
                      newJsonValue.push(newValue)
                    }
                  })
                })
              }

              log.duration(type + " > " + logTime, ((new Date().getTime() - dateStart.getTime()) / 1000))

              resolveSource()
              break;
            case 'value':
              var value = Sql.getDataSource(match[0])

              if(value.indexOf('{') > -1 || value.indexOf('[') > -1) {
                try{
                  value = JSON.parse(value)

                  jsonPage[sourceAttr][obj.key] = value
                }catch(e){
                  jsonPage[sourceAttr][obj.key] = null
                  console.log(clc.red(`Error ${value}/is not a valid JSON`),  `\n${e}`)
                }
              }
              resolveSource()
              break;
            case 'url':
              if(obj.autocomplete !== true && obj.autocomplete !== 'true') {
                var host = obj.sourceString
                host = host.split('/')
                var httpUse = http
                var defaultPort = 80
                if(host[0] === 'https:') {
                  httpUse = https
                  defaultPort = 443
                }
                host = host[2].split(':')

                var path = obj.sourceString.split('//')
                if(typeof path[1] !== 'undefined' && path[1] !== null) {
                  path = path[1].split('/')
                  path.shift()
                  path = '/' + path.join('/')
                }else {
                  path = '/'
                }
                var options = {
                  hostname: host[0],
                  port: (typeof host[1] !== 'undefined' && host[1] !== null) ? host[1] : defaultPort,
                  path: path,
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': 0
                  }
                }

                var body = ''

                var localReq = httpUse.request(options, (localRes) => {
                  localRes.setEncoding('utf8');
                  localRes.on('data', (chunk) => {
                    body += chunk;
                  });
                  localRes.on('end', () => {
                    try {
                      if(typeof body === 'string') {
                        var parsedBody = JSON.parse(body)
                        if(typeof parsedBody === 'object' && Object.prototype.toString.call(parsedBody) === '[object Array]') {
                          jsonPage[sourceAttr][obj.key] = parsedBody
                        }else if(typeof parsedBody === 'object' && Object.prototype.toString.call(parsedBody) === '[object Object]') {
                          jsonPage[sourceAttr][obj.key] = [parsedBody]
                        }
                      }else if(typeof body === 'object' && Object.prototype.toString.call(body) === '[object Array]') {
                        jsonPage[sourceAttr][obj.key] = body
                      }else if(typeof body === 'object' && Object.prototype.toString.call(body) === '[object Object]') {
                        jsonPage[sourceAttr][obj.key] = body
                      }
                    } catch(e) {
                      console.log(clc.red(`Error ${obj.sourceString} is not a valid JSON`),  `\n${e}`)
                    }
                    resolveSource()
                  })
                });

                localReq.on('error', (e) => {
                  console.log(e)
                });

                // write data to request body
                localReq.write('');
                localReq.end();
                
              }else {
                jsonPage[sourceAttr][obj.key] = obj.sourceString
                resolveSource()
              }

              break;
            case 'file':
              jsonPage[sourceAttr][obj.key] = FileParser.getJson(fileUtils.concatPath(config.root, obj.sourceString))
              resolveSource()
              break;
            default:
              resolveSource()
              break;
          }
        })
        promises.push(pSource)
      }

      Promise.all(promises)
        .then(() => {
          resolve()
        }).catch(function(e) {
          console.error(e)
        })
      // return filesRequest
      }).catch(function(e) {
        console.error(e);
      })

    return p
  }

  static removeDataList(text) {
    var listReg = /({{abe.*type=[\'|\"]data.*}})/g

    return text.replace(listReg, '')
  }

  static replaceUnwantedChar(str) {
    var chars = {"’": '', "'": '', '\"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y'};
    for(var prop in chars) str = str.replace(new RegExp(prop, 'g'), chars[prop])
    return str
  }

  static getAllAttributes(str, json) {
    str = Hooks.instance.trigger('beforeAbeAttributes', str, json)

    var defaultValues = {
        type: 'text'
        ,prefill: false
        ,prefillQuantity: null
        ,key: ''
        ,desc: ''
        ,maxLength: null
        ,tab: 'default'
        ,value: ''
        ,source: null
        ,autocomplete: null
        ,display: null
        ,reload: false
        ,order: 0
        ,required: false
        ,editable: true
        ,paginate: null
        ,visible: true
      }

    var source = getAttr(str, 'source')
    var key = getAttr(str, 'key')

    var obj = {
        type: getAttr(str, 'type')
        ,key: key
        ,prefill: getAttr(str, 'prefill')
        ,prefillQuantity: getAttr(str, 'prefill-quantity')
        ,desc: getAttr(str, 'desc')
        ,autocomplete: getAttr(str, 'autocomplete')
        ,maxLength: getAttr(str, 'max-length')
        ,value: json[key]
        ,tab: getAttr(str, 'tab')
        ,sourceString: (typeof source !== 'undefined' && source !== null && source !== '') ? source : null
        ,source: (typeof source !== 'undefined' && source !== null && source !== '')
          ? ((typeof json[config.source.name] !== 'undefined' && json[config.source.name] !== null && json[config.source.name] !== '')
              ? json[config.source.name][key] : null) : null
        ,display: getAttr(str, 'display')
        ,reload: getAttr(str, 'reload')
        ,order: getAttr(str, 'order')
        ,required: getAttr(str, 'required')
        ,visible: getAttr(str, 'visible')
        ,editable: getAttr(str, 'editable')
        ,paginate: getAttr(str, 'paginate')
      }
    obj = extend(true, defaultValues, obj)

    obj.editable = (typeof obj.editable === 'undefined' || obj.editable === null || obj.editable === '' || obj.editable === 'false') ? false : true
    obj.prefill = (typeof obj.prefill !== 'undefined' && obj.prefill !== null && obj.prefill === 'true') ? true : false
    obj.prefillQuantity = (typeof obj.prefillQuantity !== 'undefined' && obj.prefillQuantity !== null && obj.prefillQuantity !== '') ? obj.prefillQuantity : false

    obj = Hooks.instance.trigger('afterAbeAttributes', obj, str, json)

    return obj
  }
}