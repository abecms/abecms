import fse from 'fs-extra'
import path from 'path'

import {
  config
} from '../../'

export function exist(pathFile) {
  try{
    fse.statSync(pathFile)
    return true
  }catch(e){
    return false
  }

  return false
}

export function changePath(pathEnv, change) {
  pathEnv = pathEnv.replace(config.root, '').replace(/^\//, '').split('/')
  pathEnv[0] = change

  return path.join(config.root, pathEnv.join('/'))
}
