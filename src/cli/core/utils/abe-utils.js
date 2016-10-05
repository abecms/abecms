import extend from 'extend'
import clc from 'cli-color'
import fse from 'fs-extra'
import ajaxRequest from 'ajax-request'
import {Promise} from 'es6-promise'
import http from 'http' 
import https from 'https'
import path from 'path'

import {
  config
  ,cmsData
  ,folderUtils
  ,fileUtils
  ,FileParser
  ,fileAttr
  ,dateSlug
  ,dateUnslug
  ,Hooks
  ,Plugins
} from '../../'

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
    return typeof this._key[key] === 'undefined' || this._key[key] === null
  }

  /**
   * Add entry to abe engine form
   * @param {String} type        textarea | text | meta | link | image | ...
   * @param {String} key         unique ID, no space allowed
   * @param {String} desc        input description
   * @param {Int}    max-length   maximum characteres allowed inside input
   * @param {String} tab         tab name
   * @param {String} jsonValue   
   * @return {Void}
   */
  add(obj) {
    var defaultValues = {
      autocomplete: null,
      block:'',
      desc: '',
      display: null,
      editable: true,
      key: '',
      'max-length': null,
      order: 0,
      placeholder: '',
      prefill: false,
      'prefill-quantity': null,
      reload: false,
      required: false,
      source: null,
      tab: 'default',
      type: 'text',
      value: '',
      visible: true
    }

    obj = extend(true, defaultValues, obj)
    obj.key = obj.key.replace(/\./, '-')

    if(obj.key.indexOf('[') < 0 && obj.key.indexOf('.') > -1) {
      obj.block = obj.key.split('.')[0]
    }

    if(typeof this._form[obj.tab] === 'undefined' || this._form[obj.tab] === null) this._form[obj.tab] = {item:[]}

    this._key[obj.key] = true // save key for dontHaveKey()
    this._form[obj.tab].item.push(obj)
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
        var getattr = cmsData.regex.getAttr(matchAbe[i], 'key').replace('.', '[0]-')
        block = block.replace(
          matchAbe[i],
          ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="'  + getattr + '" >'
        )
      }
    }
    matchAbe = block.match(/( [A-Za-z0-9\-\_]+="*{{.*?}})/g)
    if(matchAbe){
      for (var i = 0; i < matchAbe.length; i++) {
        if(typeof matchAbe !== 'undefined' && matchAbe !== null){
          var getattr = cmsData.regex.getAttr(matchAbe[i], 'key').replace('.', '[0]-')
          var matchattr = (matchAbe[i].split('=')[0]).trim()
          block = block.replace(
              matchAbe[i],
              ' data-abe-attr-' + cmsData.regex.validDataAbe(getattr) + '="'  + matchattr + '"' +
              ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="'  + getattr + '" ' + matchAbe[i]
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

  static sanitizeSourceAttribute(obj, jsonPage){
    if(typeof obj.sourceString !== 'undefined' && obj.sourceString !== null && obj.sourceString.indexOf('{{') > -1) {
      var matches = obj.sourceString.match(/({{[a-zA-Z._]+}})/g)
      if(matches !== null) {
        Array.prototype.forEach.call(matches, (match) => {
          var val = match.replace('{{', '')
          val = val.replace('}}', '')
          
          try {
            val = eval('jsonPage.' + val)
          }catch(e) {
            val = ''
          }
          obj.sourceString = obj.sourceString.replace(match, val)
        })
      }
    }

    return obj
  }

  static requestList(obj, tplPath, match, jsonPage) {
    var p = new Promise((resolve, reject) => {
      cmsData.sql.executeQuery(tplPath, match, jsonPage)
        .then((data) => {
          if (!jsonPage['abe_source']) {
            jsonPage['abe_source'] = {}
          }
          jsonPage['abe_source'][obj.key] = data
          if (!obj.editable) {
            if (obj['max-length']) {
              jsonPage[obj.key] = data.slice(0, obj['max-length'])
            }else {
              jsonPage[obj.key] = data
            }
          } else if ((typeof jsonPage[obj.key] === 'undefined' || jsonPage[obj.key] === null) && obj.prefill) {
            if (obj['prefill-quantity'] && obj['max-length']) {
              jsonPage[obj.key] = data.slice(0, (obj['prefill-quantity'] > obj['max-length']) ? obj['max-length'] : obj['prefill-quantity'])
            }else if (obj['prefill-quantity']) {
              jsonPage[obj.key] = data.slice(0, obj['prefill-quantity'])
            }else if (obj['max-length']) {
              jsonPage[obj.key] = data.slice(0, obj['max-length'])
            }else {
              jsonPage[obj.key] = data
            }
          }

          resolve()
        })
    })

    return p
  }

  static valueList(obj, match, jsonPage) {
    var p = new Promise((resolve, reject) => {
      var value = cmsData.sql.getDataSource(match)

      if(value.indexOf('{') > -1 || value.indexOf('[') > -1) {
        try{
          value = JSON.parse(value)

          jsonPage['abe_source'][obj.key] = value
        }catch(e){
          jsonPage['abe_source'][obj.key] = null
          console.log(clc.red(`Error ${value}/is not a valid JSON`),  `\n${e}`)
        }
      }
      resolve()
    })

    return p
  }

  static urlList(obj, tplPath, match, jsonPage) {
    var p = new Promise((resolve, reject) => {
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

        var pathSource = obj.sourceString.split('//')
        if(typeof pathSource[1] !== 'undefined' && pathSource[1] !== null) {
          pathSource = pathSource[1].split('/')
          pathSource.shift()
          pathSource = '/' + path.join('/')
        }else {
          pathSource = '/'
        }
        var options = {
          hostname: host[0],
          port: (typeof host[1] !== 'undefined' && host[1] !== null) ? host[1] : defaultPort,
          path: pathSource,
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': 0
          }
        }

        var body = ''

        var localReq = httpUse.request(options, (localRes) => {
          localRes.setEncoding('utf8')
          localRes.on('data', (chunk) => {
            body += chunk
          })
          localRes.on('end', () => {
            try {
              if(typeof body === 'string') {
                var parsedBody = JSON.parse(body)
                if(typeof parsedBody === 'object' && Object.prototype.toString.call(parsedBody) === '[object Array]') {
                  jsonPage['abe_source'][obj.key] = parsedBody
                }else if(typeof parsedBody === 'object' && Object.prototype.toString.call(parsedBody) === '[object Object]') {
                  jsonPage['abe_source'][obj.key] = [parsedBody]
                }
              }else if(typeof body === 'object' && Object.prototype.toString.call(body) === '[object Array]') {
                jsonPage['abe_source'][obj.key] = body
              }else if(typeof body === 'object' && Object.prototype.toString.call(body) === '[object Object]') {
                jsonPage['abe_source'][obj.key] = body
              }
            } catch(e) {
              console.log(clc.red(`Error ${obj.sourceString} is not a valid JSON`),  `\n${e}`)
            }
            resolve()
          })
        })

        localReq.on('error', (e) => {
          console.log(e)
        })

        // write data to request body
        localReq.write('')
        localReq.end()
        
      }else {
        jsonPage['abe_source'][obj.key] = obj.sourceString
        resolve()
      }
    })

    return p
  }

  static fileList(obj, tplPath, match, jsonPage) {
    var p = new Promise((resolve, reject) => {
      jsonPage['abe_source'][obj.key] = FileParser.getJson(path.join(config.root, obj.sourceString))
      resolve()
    })

    return p
  }

  static nextDataList(tplPath, jsonPage, match) {
    var p = new Promise((resolve, reject) => {
      if(typeof jsonPage['abe_source'] === 'undefined' || jsonPage['abe_source'] === null) {
        jsonPage['abe_source'] = {}
      }

      var obj = Utils.getAllAttributes(match, jsonPage)
      obj = Utils.sanitizeSourceAttribute(obj, jsonPage)
      
      var type = cmsData.sql.getSourceType(obj.sourceString)

      switch (type) {
      case 'request':
        Utils.requestList(obj, tplPath, match, jsonPage)
            .then(() => {
              resolve()
            }).catch((e) => {
              console.log('[ERROR] abe-utils.js requestList', e)
            })
        break
      case 'value':
        Utils.valueList(obj, match, jsonPage)
            .then(() => {
              resolve()
            }).catch((e) => {
              console.log('[ERROR] abe-utils.js valueList', e)
            })
        break
      case 'url':
        Utils.urlList(obj, tplPath, match, jsonPage)
            .then(() => {
              resolve()
            }).catch((e) => {
              console.log('[ERROR] abe-utils.js urlList', e)
            })
        break
      case 'file':
        Utils.fileList(obj, tplPath, match, jsonPage)
            .then(() => {
              resolve()
            }).catch((e) => {
              console.log('[ERROR] abe-utils.js fileList', e)
            })
        break
      default:
        resolve()
        break
      }
    })

    return p
  }

  static getDataList(tplPath, text, jsonPage) {
    var p = new Promise((resolve, reject) => {

      var promises = []
      let util = new Utils()
      var matches = cmsData.regex.getTagAbeTypeRequest(text)
      Array.prototype.forEach.call(matches, (match) => {
        promises.push(Utils.nextDataList(tplPath, jsonPage, match[0]))
      })

      Promise.all(promises)
        .then(() => {
          resolve()
        }).catch(function(e) {
          console.error('abe-utils.js getDataList', e)
        })
    }).catch(function(e) {
      console.error('abe-utils.js getDataList', e)
    })

    return p
  }

  static removeDataList(text) {
    var listReg = /({{abe.*type=[\'|\"]data.*}})/g

    return text.replace(listReg, '')
  }

  static replaceUnwantedChar(str) {
    var chars = {'’': '', '\'': '', '"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y'}
    for(var prop in chars) str = str.replace(new RegExp(prop, 'g'), chars[prop])
    return str
  }

  /**
  * Get All attributes from a Abe tag
  * @return {Object} parsed attributes
  */
  static getAllAttributes(str, json) {
    str = Hooks.instance.trigger('beforeAbeAttributes', str, json)

    //This regex analyzes all attributes of a Abe tag 
    var re = /\b([a-z][a-z0-9\-]*)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig
    
    var attrs = {
      autocomplete: null,
      desc: '',
      display: null,
      editable: true,
      key: '',
      'max-length': null,
      'min-length': 0,
      order: 0,
      prefill: false,
      'prefill-quantity': null,
      reload: false,
      required: false,
      source: null,
      tab: 'default',
      type: 'text',
      value: '',
      file: '',
      visible: true
    }
    
    for (var match; match = re.exec(str); ){
      attrs[match[1]] = match[3] || match[4] || match[5]
    }

    attrs.sourceString = attrs.source
    attrs.source = (typeof attrs.source !== 'undefined' && attrs.source !== null && attrs.source !== '')? 
      ((typeof json[config.source.name] !== 'undefined' && json[config.source.name] !== null && json[config.source.name] !== '')? 
        json[config.source.name][attrs.key] : 
        null
      ) : 
      null
    attrs.editable = (typeof attrs.editable === 'undefined' || attrs.editable === null || attrs.editable === '' || attrs.editable === 'false') ? false : true

    attrs = Hooks.instance.trigger('afterAbeAttributes', attrs, str, json)

    return attrs
  }
}