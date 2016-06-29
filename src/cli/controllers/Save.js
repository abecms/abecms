import fse from 'fs-extra'
import extend from 'extend'
import mkdirp from 'mkdirp'
import xss from 'xss'
import {Promise} from 'es6-promise'

import {
  Util
  ,abeProcess
  ,FileParser
  ,getAttr
  ,config
  ,fileUtils
  ,fileAttr
  ,cli
  ,log
  ,dateSlug
  ,dateUnslug
  ,Page
  ,getTemplate
  ,Hooks
  ,Plugins
  ,cleanSlug
} from '../'

export function checkRequired(text, json) {
  var regAbe = /{{abe[\S\s].*?key=['|"]([\S\s].*?['|"| ]}})/g
  var matches = text.match(regAbe)
  var requiredValue = 0
  var complete = 0
  if(typeof matches !== 'undefined' && matches !== null){
    Array.prototype.forEach.call(matches, (match) => {
      if(typeof match !== 'undefined' && match !== null) {
        
        var keyAttr = getAttr(match, 'key')
        var requiredAttr = getAttr(match, 'required')
        if(requiredAttr === 'true') {
          requiredValue++

          var minAttr = getAttr(match, 'min-length')
          minAttr = (minAttr !== '') ? minAttr : 0

          if(typeof json[keyAttr] !== 'undefined' && json[keyAttr] !== null && json[keyAttr] !== '') {
            if(minAttr > 0) {
              if(json[keyAttr].length >= minAttr) {
                complete++
              }
            }else {
              complete++
            }
          }else {
          }
        }
      }
    })
  }

  return Math.round((requiredValue > 0) ? complete * 100 / requiredValue : 100)
}

export function save(url, tplPath, json = null, text = '', type = '', previousSave = null, realType = 'draft', publishAll = false) {
  url = cleanSlug(url)

  var p = new Promise((resolve, reject) => {
    if(type === 'reject'){
      url = Hooks.instance.trigger('beforeReject', url)
      type = 'draft'
      realType = 'draft'
      url = Hooks.instance.trigger('afterReject', url)
      resolve({reject: fileAttr.delete(url).replace(fileUtils.concatPath(config.root, config.draft.url), '')})
    }
    var tplUrl = FileParser.getFileDataFromUrl(url)
    type = type || FileParser.getType(url)
    var path = dateIso(tplUrl, type)
    if(typeof previousSave !== 'undefined' && previousSave !== null){
      path.jsonPath = fileUtils.concatPath(config.root, previousSave.jsonPath.replace(config.root, '')).replace(/-abe-d/, `-abe-${realType[0]}`)
      path.htmlPath = fileUtils.concatPath(config.root, previousSave.htmlPath.replace(config.root, '')).replace(/-abe-d/, `-abe-${realType[0]}`)
    }

    if (tplPath.indexOf('.') > -1) {
      tplPath = fileUtils.removeExtension(tplPath)
    }
    var tpl = tplPath.replace(config.root, '')
    var fullTpl = fileUtils.concatPath(config.root, config.templates.url, tpl) + '.' + config.files.templates.extension

    if(typeof json === 'undefined' || json === null) {
      json = FileParser.getJson(tplUrl.json.path)
    }

    var ext = {
      template: tpl,
      link: tplUrl.publish.link,
      complete: 0,
      type: type
    }

    let meta = config.meta.name
    json[meta] = extend(json[meta], ext)
    var date = fileAttr.get(path.jsonPath).d

    if (publishAll) {
      date = json[meta].publish.date
    }
    if(typeof date === 'undefined' || date === null || date === '') {
      date = new Date()
    }else {
      date = new Date(date)
    }
    Util.addMetas(tpl, json, type, {}, date, realType)

    if(typeof text === 'undefined' || text === null || text === '') {
      text = getTemplate(fullTpl)
    }

    Util.getDataList(fileUtils.removeLast(tplUrl.publish.link), text, json)
        .then(() => {

        if (publishAll) {
          // console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
          // console.log(path.jsonPath)
          // console.log(text.split("head")[1])
          // console.log(json.hreflangs)
        }

          var obj = {
            type:type,
            template:{
              path: fullTpl
            },
            html: {
              path:path.htmlPath
            },
            json: {
              content: json,
              path: path.jsonPath
            }
          }

          obj = Hooks.instance.trigger('beforeSave', obj)

          obj.json.content[meta].complete = checkRequired(text, obj.json.content)

          text = Util.removeDataList(text)

          var page = new Page(tplUrl.publish.path, text, obj.json.content, true)

          saveJson(obj.json.path, obj.json.content)
          saveHtml(obj.html.path, page.html)

          obj = Hooks.instance.trigger('afterSave', obj)
          
          FileParser.copySiteAssets()

          if(typeof config.publishAll !== 'undefined' && config.publishAll !== null && config.publishAll === true) {
            if(!publishAll && type === 'publish') {
              abeProcess('publish-all', [`FILEPATH=${json.abe_meta.link}`])
            }
          }

          resolve({
            json: obj.json.content,
            jsonPath: obj.json.path,
            html: page.html,
            htmlPath: path.htmlPath
          })
        }).catch(function(e) {
          console.error(e.stack)
        })
  })

  return p
}

export function saveJson(url, json) {
  mkdirp.sync(fileUtils.removeLast(url))

  if(typeof json.abe_source !== 'undefined' && json.abe_source !== null) {
    delete json.abe_source
  }

  var eachRecursive = function (obj) {
    for (var k in obj) {
      if (typeof obj[k] === "object" && obj[k] !== null) eachRecursive(obj[k])
      else if (typeof obj[k] !== "undefined" && obj[k] !== null) obj[k] = xss(obj[k].toString().replace(/&quot;/g, '"'), { "whiteList": config.htmlWhiteList })
    }
  }

  eachRecursive(json)

  fse.writeJsonSync(url, json, {
    space: 2,
    encoding: 'utf-8'
  })
}

export function saveHtml(url, html) {
  mkdirp.sync(fileUtils.removeLast(url))
  if(fileAttr.test(url) && fileAttr.get(url).s !== 'd'){
    fileUtils.deleteOlderRevisionByType(fileAttr.delete(url), fileAttr.get(url).s)
  }
  
  fse.writeFileSync(url, html)
}

export function dateIso(tplUrl, type = null) {
  var newDateISO
  var dateISO
  var validate

  var saveJsonFile = tplUrl.json.path
  var saveFile = tplUrl['draft'].path
  var oldDateISO = fileAttr.get(saveFile).d
  
  switch(type) {
    case 'draft':
      newDateISO = dateSlug((new Date().toISOString()))
      dateISO = 'd' + newDateISO
      break;
    case 'publish':
      saveJsonFile = tplUrl.publish.json
      saveFile = tplUrl.publish.path
      break;
    default:
      newDateISO = dateSlug((new Date().toISOString()))
      dateISO = type[0] + newDateISO
      break;
  }

  if(dateISO) {
    saveJsonFile = fileAttr.add(saveJsonFile, dateISO)
    saveFile = fileAttr.add(saveFile, dateISO)
  }

  return {
    jsonPath: saveJsonFile,
    htmlPath: saveFile
  }
}