import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import xss from 'xss'
import path from 'path'

import {
  config
} from '../../'

export function saveJson(url, json) {
  mkdirp.sync(path.dirname(url))

  if(typeof json.abe_source !== 'undefined' && json.abe_source !== null) {
    delete json.abe_source
  }

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

  fse.writeJsonSync(url, json, {
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