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

/**
 * This method checks that the path leads to a file and return the content as UTF-8 content
 * @param  {string} path The path
 * @return {string}      The content of the UTF-8 file
 */
export function getContent(pathFile) {
  var res = null
  if(typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
    if (exist(pathFile)) {
      res = fse.readFileSync(pathFile, 'utf8')
    }
  }
  return res
}