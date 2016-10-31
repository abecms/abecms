import path from 'path'
import fse from 'fs-extra'

import {
  cmsData,
  config
} from '../../'

export function getFiles(name = '') {
  var pathToReferences = path.join(config.root, config.reference.url)
  var res = {}

  if(name !== '') res[name] = cmsData.file.get(name)
  else {
    Array.prototype.forEach.call(fse.readdirSync(pathToReferences), (el) => {
      var pathToReference = path.join(pathToReferences, el)
      if(el.indexOf('.json') > -1) res[pathToReference] = cmsData.file.get(pathToReference)
    })
  }

  return res
}

export function saveFile(url, json) {
  fse.writeJson(url, JSON.parse(json), function (err) {
    if(err) console.log('saveFile reference error: ', err)
  })
}
