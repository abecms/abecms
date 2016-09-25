import extend from 'extend'
import loremIpsum from 'lorem-ipsum'
import clc from 'cli-color'
import fse from 'fs-extra'
import ajaxRequest from 'ajax-request'
import {Promise} from 'es6-promise'
import http from 'http' 
import https from 'https'
import path from 'path'

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
  ,TimeMesure
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
        return typeof this._key[key] === 'undefined' || this._key[key] === null
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
   * Test if a string contains string key from {{#each}} block statement
   * @param  {String}  str string to test
   * @return {Boolean} true = this is a block content
   */
    dataRequest(text) {
        let listReg = /({{abe.*type=[\'|\"]data.*}})/g
        var matches = []
        var match
        while (match = listReg.exec(text)) {
            matches.push(match)
        }
        return matches
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
                '-'
      , '['
      , ']'
      // order doesn't matter for any of these
      , '/'
      , '{'
      , '}'
      , '('
      , ')'
      , '*'
      , '+'
      , '?'
      , '.'
      , '\\'
      , '^'
      , '$'
      , '|'
            ]

    // I choose to escape every character with '\'
    // even though only some strictly require it when inside of []
    , regex = RegExp('[' + specials.join('\\') + ']', 'g')
        return str.replace(regex, '\\$&')
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

    static requestList(obj, sourceAttr, tplPath, match, jsonPage) {
        var p = new Promise((resolve, reject) => {
            Sql.executeQuery(tplPath, match, jsonPage)
        .then((data) => {
            jsonPage[sourceAttr][obj.key] = data
            if (!obj.editable) {
                if (obj.maxLength) {
                    jsonPage[obj.key] = data.slice(0, obj.maxLength)
                }else {
                    jsonPage[obj.key] = data
                }
            } else if (obj.prefill) {
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

            resolve()
        })
        })

        return p
    }

    static valueList(obj, sourceAttr, tplPath, match, jsonPage) {
        var p = new Promise((resolve, reject) => {
            var value = Sql.getDataSource(match)

            if(value.indexOf('{') > -1 || value.indexOf('[') > -1) {
                try{
                    value = JSON.parse(value)

                    jsonPage[sourceAttr][obj.key] = value
                }catch(e){
                    jsonPage[sourceAttr][obj.key] = null
                    console.log(clc.red(`Error ${value}/is not a valid JSON`),  `\n${e}`)
                }
            }
            resolve()
        })

        return p
    }

    static urlList(obj, sourceAttr, tplPath, match, jsonPage) {
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
                jsonPage[sourceAttr][obj.key] = obj.sourceString
                resolve()
            }
        })

        return p
    }

    static fileList(obj, sourceAttr, tplPath, match, jsonPage) {
        var p = new Promise((resolve, reject) => {
            jsonPage[sourceAttr][obj.key] = FileParser.getJson(path.join(config.root, obj.sourceString))
            resolve()
        })

        return p
    }

    static nextDataList(tplPath, text, jsonPage, match) {
        var p = new Promise((resolve, reject) => {
      // var t = new TimeMesure()
            var sourceAttr = config.source.name

            if(typeof jsonPage[sourceAttr] === 'undefined' || jsonPage[sourceAttr] === null) {
                jsonPage[sourceAttr] = {}
            }

            var obj = Utils.getAllAttributes(match, jsonPage)
            obj = Utils.sanitizeSourceAttribute(obj, jsonPage)
      
            var type = Sql.getSourceType(obj.sourceString)

            switch (type) {
            case 'request':
                Utils.requestList(obj, sourceAttr, tplPath, match, jsonPage)
            .then(() => {
              // t.duration(match)
                resolve()
            }).catch((e) => {
                console.log('[ERROR] abe-utils.js requestList', e)
            })
                break
            case 'value':
                Utils.valueList(obj, sourceAttr, tplPath, match, jsonPage)
            .then(() => {
                resolve()
            }).catch((e) => {
                console.log('[ERROR] abe-utils.js valueList', e)
            })
                break
            case 'url':
                Utils.urlList(obj, sourceAttr, tplPath, match, jsonPage)
            .then(() => {
                resolve()
            }).catch((e) => {
                console.log('[ERROR] abe-utils.js urlList', e)
            })
                break
            case 'file':
                Utils.fileList(obj, sourceAttr, tplPath, match, jsonPage)
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
      // var t = new TimeMesure('getDataList')

            var promises = []
            let util = new Utils()
            var matches = util.dataRequest(text)
            Array.prototype.forEach.call(matches, (match) => {
                promises.push(Utils.nextDataList(tplPath, text, jsonPage, match[0]))
            })

            Promise.all(promises)
        .then(() => {
          // t.duration()
            resolve()
        }).catch(function(e) {
            console.error('abe-utils.js getDataList', e)
        })
      // return filesRequest
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
        var chars = {'’': '', '\'': '', '\"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y'}
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
        }
        obj = extend(true, defaultValues, obj)

        obj.editable = (typeof obj.editable === 'undefined' || obj.editable === null || obj.editable === '' || obj.editable === 'false') ? false : true
        obj.prefill = (typeof obj.prefill !== 'undefined' && obj.prefill !== null && obj.prefill === 'true') ? true : false
        obj.prefillQuantity = (typeof obj.prefillQuantity !== 'undefined' && obj.prefillQuantity !== null && obj.prefillQuantity !== '') ? obj.prefillQuantity : false

        obj = Hooks.instance.trigger('afterAbeAttributes', obj, str, json)

        return obj
    }
}