import path from 'path'
import mkdirp from 'mkdirp'
import execPromise from 'child-process-promise'

import {
  coreUtils,
  cmsStructure,
  cmsData,
  config
} from '../../'

export function addFolder(folderPath) {
  mkdirp(path.join(config.root, folderPath), function (err) {
    if (err) console.error(err)
  })
  return folderPath
}

export function removeFolder(folderPath) {
  execPromise.exec('rm -rf ' + path.join(config.root, folderPath)).then(function (result) {
    var stdout = result.stdout
    var stderr = result.stderr
    if(stdout) console.log('stdout: ', stdout)
    if(stderr) console.log('stderr: ', stderr)
  })
  return folderPath
}

export function editStructure(type, folderPath) {
  if(type === 'add') cmsStructure.structure.addFolder(folderPath)
  else cmsStructure.structure.removeFolder(folderPath)
  
  return folderPath
}
