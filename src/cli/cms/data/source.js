import {Promise} from 'bluebird'
import http from 'http'
import https from 'https'
import path from 'path'
import fse from 'fs-extra'
import _ from 'lodash'

import {config, coreUtils, cmsData} from '../../'

export function requestList(obj, match, jsonPage) {
  var p = new Promise(resolve => {
    cmsData.sql.executeQuery(match, jsonPage).then(data => {
      if (!jsonPage['abe_source']) {
        jsonPage['abe_source'] = {}
      }
      jsonPage['abe_source'][obj.key] = data

      // I update the jsonPage[obj.key] when the tag is not editable
      if (!obj.editable) {
        if (obj['max-length']) {
          jsonPage[obj.key] = data.slice(0, obj['max-length'])
        } else {
          jsonPage[obj.key] = data
        }
      // I update the jsonPage[obj.key] only if empty or obj.prefill
      } else if (jsonPage[obj.key] == null && obj.prefill) {
        if (obj['prefill-quantity'] && obj['max-length']) {
          jsonPage[obj.key] = data.slice(
            0,
            obj['prefill-quantity'] > obj['max-length']
              ? obj['max-length']
              : obj['prefill-quantity']
          )
        } else if (obj['prefill-quantity']) {
          jsonPage[obj.key] = data.slice(0, obj['prefill-quantity'])
        } else if (obj['max-length']) {
          jsonPage[obj.key] = data.slice(0, obj['max-length'])
        } else {
          jsonPage[obj.key] = data
        }
      }

      resolve(jsonPage)
    })
  })

  return p
}

export function valueList(obj, match, jsonPage) {
  var p = new Promise(resolve => {
    var value = cmsData.sql.getDataSource(match)

    if (value.indexOf('{') > -1 || value.indexOf('[') > -1) {
      try {
        value = JSON.parse(value)

        jsonPage['abe_source'][obj.key] = value
      } catch (e) {
        jsonPage['abe_source'][obj.key] = null
        console.log(`Error ${value}/is not a valid JSON`, `\n${e}`)
      }
    }
    resolve()
  })

  return p
}

export function urlList(obj, match, jsonPage) {
  var p = new Promise(resolve => {
    if (obj.autocomplete !== true && obj.autocomplete !== 'true') {
      var host = obj.sourceString
      host = host.split('/')
      var httpUse = http
      var defaultPort = 80
      if (host[0] === 'https:') {
        httpUse = https
        defaultPort = 443
      }
      host = host[2].split(':')

      var pathSource = obj.sourceString.split('//')
      if (pathSource[1] != null) {
        pathSource = pathSource[1].split('/')
        pathSource.shift()
        pathSource = '/' + pathSource.join('/')
      } else {
        pathSource = '/'
      }
      var options = {
        hostname: host[0],
        port: host[1] != null ? host[1] : defaultPort,
        path: pathSource,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': 0
        }
      }

      var body = ''

      var localReq = httpUse.request(options, localRes => {
        localRes.setEncoding('utf8')
        localRes.on('data', chunk => {
          body += chunk
        })
        localRes.on('end', () => {
          try {
            if (typeof body === 'string') {
              var parsedBody = JSON.parse(body)
              if (
                typeof parsedBody === 'object' &&
                Object.prototype.toString.call(parsedBody) === '[object Array]'
              ) {
                jsonPage['abe_source'][obj.key] = parsedBody
              } else if (
                typeof parsedBody === 'object' &&
                Object.prototype.toString.call(parsedBody) === '[object Object]'
              ) {
                jsonPage['abe_source'][obj.key] = [parsedBody]
              }
            } else if (
              typeof body === 'object' &&
              Object.prototype.toString.call(body) === '[object Array]'
            ) {
              jsonPage['abe_source'][obj.key] = body
            } else if (
              typeof body === 'object' &&
              Object.prototype.toString.call(body) === '[object Object]'
            ) {
              jsonPage['abe_source'][obj.key] = body
            }
          } catch (e) {
            console.log(
              `Error ${obj.sourceString} is not a valid JSON`,
              `\n${e}`
            )
          }
          resolve()
        })
      })

      localReq.on('error', e => {
        console.log(e)
      })

      // write data to request body
      localReq.write('')
      localReq.end()
    } else {
      jsonPage['abe_source'][obj.key] = obj.sourceString
      resolve()
    }
  })

  return p
}

export function fileList(obj, match, jsonPage) {
  var p = new Promise(resolve => {
    jsonPage['abe_source'][obj.key] = coreUtils.file.getJson(
      path.join(config.root, obj.sourceString)
    )
    resolve()
  })

  return p
}

export async function nextSourceData(jsonPage, match) {
    let obj = cmsData.attributes.getAll(match, jsonPage)
    const sourceType = cmsData.sql.getSourceType(obj.sourceString)

    if (sourceType === 'file' && obj.type !== 'data' && obj.type !== 'import') {
      obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage)
      let file = obj.sourceString

      if (file.charAt(0) == '/') {
        file = path.join(config.root, file)
      } else {
        file = path.join(config.root, config.reference.url, file)
      }

      // Do I have to save data
      if (_.get(jsonPage, obj.key) != null) {
        let newJson = {}
        if (coreUtils.file.exist(file)) {
          newJson = await cmsData.file.get(file)
          if(_.get(newJson, obj.key) !== _.get(jsonPage, obj.key)) {
            _.set(newJson, obj.key, _.get(jsonPage, obj.key));
            await fse.writeJson(file, newJson)
          }
        } else {
          _.set(newJson, obj.key, _.get(jsonPage, obj.key));
          await fse.mkdir(file.split('/').slice(0, -1).join('/'))
          await fse.writeJson(file, newJson, {space: 2, encoding: 'utf-8'})
        }
        _.unset(jsonPage, obj.key);
      // Or do I have to only read data
      } else {
        if (coreUtils.file.exist(file)) {
          const newJson = await cmsData.file.get(file)

          if (_.get(newJson, obj.key) != null) {
            _.set(jsonPage, obj.key, _.get(newJson, obj.key))
          }
        }
      }
    }

}

export function nextDataList(jsonPage, match) {
  var p = new Promise(resolve => {
    if (jsonPage['abe_source'] == null) {
      jsonPage['abe_source'] = {}
    }

    var obj = cmsData.attributes.getAll(match, jsonPage)

    var type = cmsData.sql.getSourceType(obj.sourceString)

    switch (type) {
      case 'request':
        obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage)
        requestList(obj, match, jsonPage)
          .then(jsonPage => {
            resolve(jsonPage)
          })
          .catch(e => {
            console.log('[ERROR] source.js requestList', e)
          })
        break
      case 'value':
        obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage)
        valueList(obj, match, jsonPage)
          .then(() => {
            resolve()
          })
          .catch(e => {
            console.log('[ERROR] source.js valueList', e)
          })
        break
      case 'url':
        urlList(obj, match, jsonPage)
          .then(() => {
            resolve()
          })
          .catch(e => {
            console.log('[ERROR] source.js urlList', e)
          })
        break
      case 'file':
        obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage)
        fileList(obj, match, jsonPage)
          .then(() => {
            resolve()
          })
          .catch(e => {
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

export async function getSourceData(text, jsonPage) {
  var matches = cmsData.regex.getTagAbeWithSource(text)

  const result = await Promise.all(
    matches.map(async match => {
      await nextSourceData(jsonPage, match)
    })
  )

  return result
}

export async function getDataList(text, jsonPage) {
  var matches = cmsData.regex.getTagAbeTypeRequest(text)
  const result = await Promise.all(
    matches.map(async match => {
      await nextDataList(jsonPage, match[0])
    })
  )

  return cmsData.source.getSourceData(text, jsonPage)
}

export function removeDataList(text) {
  return text.replace(cmsData.regex.dataTypeReg, '')
}

export function removeNonEditableDataList(text) {
  return text.replace(cmsData.regex.nonEditableDataReg, '')
}

/**
 * Remove all type='data' outside {{#each}} statements
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */
export function removeNonEachDataList(text) {
  // removing each blocks potentially containing abe data type
  let pattEach = /(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g
  let textWithNoEach = text.replace(pattEach, '')

  var match
  while ((match = cmsData.regex.dataTypeReg.exec(textWithNoEach))) {
    text = text.replace(match[0], '')
  }

  return text
}
