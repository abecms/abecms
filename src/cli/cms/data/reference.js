import path from 'path'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'

import {
  abeExtend,
  coreUtils,
  cmsData,
  config
} from '../../'

export function getFiles() {
  var arr = []
  var res = []
  arr = cmsData.file.read(
    path.join(config.root, config.reference.url),
    path.join(config.root, config.reference.url),
    'files',
    true,
    /(.json*?)/
  )

  arr.forEach(function (el) {
    res.push({
      name: el.name,
      data: cmsData.file.get(el.path)
    })
  })

  return res
}
