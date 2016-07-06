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
      template: tpl.replace(/^\/+/, ''),
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

    /**
     * For paginate
     */
    var listRegSource = /({{abe.*type=[\'|\"]data.*}})/g
      ,matchSource
      ,paginated = []

    while (matchSource = listRegSource.exec(text)) {
      var objSource = Util.getAllAttributes(matchSource[0], json)
      if(typeof objSource.paginate !== 'undefined' && objSource.paginate !== null && objSource.paginate !== '') {
        paginated.push({
          key: objSource.key,
          size: parseInt(objSource.paginate)
        })
      }
    }

    Util.getDataList(fileUtils.removeLast(tplUrl.publish.link), text, json)
        .then(() => {

        for(var prop in json){
          if(typeof json[prop] === 'object' && Array.isArray(json[prop]) && json[prop].length === 1){
            var valuesAreEmplty = true
            json[prop].forEach(function (element) {
              for(var p in element) {
                if(element[p] !== '') valuesAreEmplty = false
              }
            })
            if(valuesAreEmplty) delete json[prop];
          }
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

          var res = {}

          if (paginated.length > 0) {
            Array.prototype.forEach.call(paginated, (page) => {
              if(typeof page.key !== 'undefined' && page.key !== null) {
                res = saveJsonAndHtml(tplUrl.publish.path, obj.json.path, obj.html.path, obj.json.content, text, type, page.key, page.size)
              }
            })
          }else {
            res = saveJsonAndHtml(tplUrl.publish.path, obj.json.path, obj.html.path, obj.json.content, text, type)
          }

          obj = Hooks.instance.trigger('afterSave', obj)
          
          FileParser.copySiteAssets()

          if(typeof config.publishAll !== 'undefined' && config.publishAll !== null && config.publishAll === true) {
            if(!publishAll && type === 'publish') {
              abeProcess('publish-all', [`FILEPATH=${json.abe_meta.link}`])
            }
          }

          resolve(res)
        }).catch(function(e) {
          console.error(e)
        })
  })

  return p
}

function splitArray(ar, chunkSize) {
  return [].concat.apply([],
      ar.map(function(elem,i) {
          return i%chunkSize ? [] : [ar.slice(i,i+chunkSize)]
      })
  )
}

export function saveJsonAndHtml(tplPath, jPath, hPath, json, html, type, paginateKey, paginateSize) {
  var page = ''

  if(type === 'publish' && typeof paginateKey !== 'undefined' && paginateKey !== null) {
    var jsonPart = splitArray(json[paginateKey], paginateSize)
    var pageToSave = []
    var paginateLink = []

    var currentUrl = fileUtils.removeExtension(hPath)
    currentUrl = currentUrl.replace(config.root, '')
    currentUrl = currentUrl.replace(config.publish.url, '')

    for(var k = 1, length3 = jsonPart.length; k <= length3; k++) {
      var newJson = JSON.parse(JSON.stringify(json))
      newJson[paginateKey] = jsonPart[k-1]
      var current = k
      var prev
      var next
      if (k !== 1) {
        prev = k-1
      }
      if (k !== length3) {
        next = k+1
      }

      var paginatePath = ''
      if (k === 1) {
        paginatePath = hPath
      }else {
        paginatePath = fileUtils.removeExtension(hPath) + '-' + k + '.' + config.files.templates.extension
      }

      var link = paginatePath.replace(config.root, '')
          link = link.replace(config.publish.url, '')

      paginateLink.push({
        link: link,
        index: k
      })
      var currentJson = {
        size: paginateSize,
        path: paginatePath,
        current: k,
        json: newJson
      }
      if (prev > 0) {
        currentJson.prev = currentUrl + '-' + (k-1) + '.' + config.files.templates.extension
      }
      if (k < length3) {
        currentJson.next = currentUrl + '-' + (next) + '.' + config.files.templates.extension
      }
      currentJson.first = currentUrl + '.' + config.files.templates.extension
      currentJson.last = currentUrl + '-' + length3 + '.' + config.files.templates.extension

      pageToSave.push(currentJson)
    }

    Array.prototype.forEach.call(pageToSave, (pSave) => {
      var jsonToSave = JSON.parse(JSON.stringify(pSave.json))
      if(typeof jsonToSave.abe_meta.paginate === 'undefined' || jsonToSave.abe_meta.paginate === null) {
        jsonToSave.abe_meta.paginate = {}
      }
      jsonToSave.abe_meta.paginate[paginateKey] = {
        size: pSave.size,
        current: pSave.current,
        links: paginateLink
      }
      if(typeof (pSave.prev) !== 'undefined' && (pSave.prev) !== null) {
        jsonToSave.abe_meta.paginate[paginateKey].prev = pSave.prev
      }
      if(typeof (pSave.next) !== 'undefined' && (pSave.next) !== null) {
        jsonToSave.abe_meta.paginate[paginateKey].next = pSave.next
      }
      if(typeof (pSave.first) !== 'undefined' && (pSave.first) !== null) {
        jsonToSave.abe_meta.paginate[paginateKey].first = pSave.first
      }
      if(typeof (pSave.last) !== 'undefined' && (pSave.last) !== null) {
        jsonToSave.abe_meta.paginate[paginateKey].last = pSave.last
      }

      page = new Page(tplPath, html, jsonToSave, true)
      saveHtml(pSave.path, page.html)
    })

    if(typeof json.abe_meta.paginate === 'undefined' || json.abe_meta.paginate === null) {
        json.abe_meta.paginate = {
          links: paginateLink,
          size: paginateSize
        }
      }
  }else {
    page = new Page(tplPath, html, json, true)

    saveHtml(hPath, page.html)
  }
  saveJson(jPath, json)
  // page = new Page(tplPath, html, json, true)

  // saveHtml(hPath, page.html)

  return {
    json: json,
    jsonPath: jPath,
    html: page.html,
    htmlPath: hPath
  }
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