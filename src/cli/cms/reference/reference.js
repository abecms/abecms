import path from 'path'
import fse from 'fs-extra'

import {
  coreUtils,
  cmsData,
  config
} from '../../'

export function getFiles(name = '') {
  const pathToReferences = path.join(config.root, config.reference.url)
  let res = {}

  if(name !== '') res[name] = cmsData.file.get(name)
  else {
    const files = coreUtils.file.getFilesSync(pathToReferences, true, '.json')
    Array.prototype.forEach.call(files, (pathFile) => {
      var fileName = pathFile.split('/')
      res[fileName[fileName.length - 1]] = cmsData.file.get(pathFile)
    })
  }

  return res
}

export function saveFile(url, json) {
  fse.writeJson(path.join(config.root, config.reference.url, url), JSON.parse(json), function (err) {
    if(err) console.log('saveFile reference error: ', err)
  })
}
