import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import xss from 'xss'
import path from 'path'

import {
  config,
  mongo,
  cmsData
} from '../../'

export async function saveJson(jsonPath, json) {

  let result = false;
  if (config.database.type == "file") {
    result = await saveJsonFile(jsonPath, json);
  }
  else if (config.database.type == "mongo") {
    result = await mongo.saveJson(jsonPath, json);
  }

  return result
}

export async function saveJsonFile(jsonPath, json) {
  jsonPath = cmsData.utils.getRevisionPath(jsonPath)
  mkdirp.sync(path.dirname(jsonPath))

  if (json.abe_source != null) delete json.abe_source
  if (json.abeEditor != null) delete json.abeEditor

  var eachRecursive = function(obj) {
    for (var k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        eachRecursive(obj[k])
      } else if (typeof obj[k] !== 'undefined' && obj[k] !== null) {
        if (config.xss) {
          obj[k] = xss(obj[k].toString().replace(/&quot;/g, '"'), {
            whiteList: config.htmlWhiteList
          })
        } else {
          obj[k] = obj[k].toString().replace(/&quot;/g, '"')
        }
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

export async function saveHtml(pathFile, html) {
  await mkdirp(path.dirname(pathFile))
  await fse.writeFile(pathFile, html)

  return true
}