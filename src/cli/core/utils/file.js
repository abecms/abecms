import Promise from 'bluebird'
import path from 'path'
var fse = Promise.promisifyAll(require('fs-extra'))

import {
  config,
  coreUtils
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

/**
 * Promisified fse walker with recursive and extension options
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFiles(dirname, recursive=true, filterExt = '') {
  let items = []
  return fse.readdirAsync(dirname).map(function(fileName) {
    let pathFile = path.join(dirname, fileName)
    return fse.statAsync(pathFile).then(function(stat) {
      if (stat.isFile()) {
        let extFile = path.extname(fileName)
        if (filterExt === '' || extFile === filterExt) {
          return items.push(pathFile)
        }
        return 
      }
      if (recursive) {
        return coreUtils.file.getFiles(pathFile, recursive, filterExt).then(function(filesInDir) {
          items = items.concat(filesInDir)
        })
      }
    })
  }).then(function() {
    return items
  })
}