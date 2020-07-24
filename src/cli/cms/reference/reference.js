import path from 'path'
import fse from 'fs-extra'

import {coreUtils, cmsData, config} from '../../'

export function getFiles(name = '') {
  const pathToReferences = path.join(config.root, config.reference.url)
  let res = {}

  if (name !== '')
    res[name] = coreUtils.file.getJson(path.join(pathToReferences, name))
  else {
    const files = coreUtils.file.getFilesSync(pathToReferences, true, '.json')
    Array.prototype.forEach.call(files, pathFile => {
      const fileName = pathFile.split(path.sep)
      res[fileName[fileName.length - 1]] = coreUtils.file.getJson(pathFile)
    })
  }

  return res
}

export function saveFile(url, json) {
  fse.exists(path.join(config.root, config.reference.url), function(exists) {
    if (!exists) {
      fse.mkdir(path.join(config.root, config.reference.url), function() {
        fse.writeJson(
          path.join(config.root, config.reference.url, url),
          JSON.parse(json)
        )
      })
    } else {
      fse.writeJson(
        path.join(config.root, config.reference.url, url),
        JSON.parse(json),
        function(err) {
          if (err) console.log('saveFile reference error: ', err)
        }
      )
    }
  })
}
