import path from 'path'

import {
  cmsData,
  config
} from '../../'

export function getFiles() {
  var arr = []
  var res = {}
  arr = cmsData.file.read(
    path.join(config.root, config.reference.url),
    path.join(config.root, config.reference.url),
    'files',
    true,
    /(.json*?)/
  )

  Array.prototype.forEach.call(arr, (el) => {
    res[el.name] = cmsData.file.get(el.path)
  })

  return res
}
