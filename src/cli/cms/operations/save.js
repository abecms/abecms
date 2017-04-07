import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import xss from 'xss'
import path from 'path'

import {
  config
} from '../../'

export function saveJson(jsonPath, json) {
  mkdirp.sync(path.dirname(jsonPath))

  if(json.abe_source != null) delete json.abe_source
  if(json.abeEditor != null) delete json.abeEditor

  var eachRecursive = function (obj) {
    for (var k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null){
        eachRecursive(obj[k])
      } else if (typeof obj[k] !== 'undefined' && obj[k] !== null){
        obj[k] = xss(obj[k].toString().replace(/&quot;/g, '"'), { 'whiteList': config.htmlWhiteList })
      }
    }
  }

  eachRecursive(json)

  fse.writeJsonSync(jsonPath, json, {
    space: 2,
    encoding: 'utf-8'
  })

  return true
}

export function saveHtml(url, html) {
  mkdirp.sync(path.dirname(url))
  fse.writeFileSync(url, html)

  return true
}
