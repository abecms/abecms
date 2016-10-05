import {Promise} from 'es6-promise'
import http from 'http' 
import https from 'https'
import path from 'path'

import {
  config,
  cmsData,
  Util,
  FileParser
} from '../../'

export function requestList(obj, tplPath, match, jsonPage) {
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

export function valueList(obj, match, jsonPage) {
  var p = new Promise((resolve, reject) => {
    var value = cmsData.sql.getDataSource(match)

    if(value.indexOf('{') > -1 || value.indexOf('[') > -1) {
      try{
        value = JSON.parse(value)

        jsonPage['abe_source'][obj.key] = value
      }catch(e){
        jsonPage['abe_source'][obj.key] = null
        console.log(`Error ${value}/is not a valid JSON`, `\n${e}`)
      }
    }
    resolve()
  })

  return p
}

export function urlList(obj, tplPath, match, jsonPage) {
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
            console.log(`Error ${obj.sourceString} is not a valid JSON`, `\n${e}`)
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

export function fileList(obj, tplPath, match, jsonPage) {
  var p = new Promise((resolve, reject) => {
    jsonPage['abe_source'][obj.key] = FileParser.getJson(path.join(config.root, obj.sourceString))
    resolve()
  })

  return p
}

export function nextDataList(tplPath, jsonPage, match) {
  var p = new Promise((resolve, reject) => {
    if(typeof jsonPage['abe_source'] === 'undefined' || jsonPage['abe_source'] === null) {
      jsonPage['abe_source'] = {}
    }

    var obj = cmsData.attributes.getAll(match, jsonPage)
    obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage)
    
    var type = cmsData.sql.getSourceType(obj.sourceString)

    switch (type) {
    case 'request':
      requestList(obj, tplPath, match, jsonPage)
          .then(() => {
            resolve()
          }).catch((e) => {
            console.log('[ERROR] source.js requestList', e)
          })
      break
    case 'value':
      valueList(obj, match, jsonPage)
          .then(() => {
            resolve()
          }).catch((e) => {
            console.log('[ERROR] source.js valueList', e)
          })
      break
    case 'url':
      urlList(obj, tplPath, match, jsonPage)
          .then(() => {
            resolve()
          }).catch((e) => {
            console.log('[ERROR] source.js urlList', e)
          })
      break
    case 'file':
      fileList(obj, tplPath, match, jsonPage)
          .then(() => {
            resolve()
          }).catch((e) => {
            console.log('[ERROR] source.js fileList', e)
          })
      break
    default:
      resolve()
      break
    }
  })

  return p
}

export function getDataList(tplPath, text, jsonPage) {
  var p = new Promise((resolve, reject) => {

    var promises = []
    var matches = cmsData.regex.getTagAbeTypeRequest(text)
    Array.prototype.forEach.call(matches, (match) => {
      promises.push(nextDataList(tplPath, jsonPage, match[0]))
    })

    Promise.all(promises)
      .then(() => {
        resolve()
      }).catch(function(e) {
        console.error('source.js getDataList', e)
      })
  }).catch(function(e) {
    console.error('source.js getDataList', e)
  })

  return p
}

export function removeDataList(text) {
  var listReg = /({{abe.*type=[\'|\"]data.*}})/g

  return text.replace(listReg, '')
}