import Promise from 'bluebird'
import path from 'path'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'

import {config, cmsData, coreUtils} from '../../'

export function exist(pathFile) {
  try {
    fse.statSync(pathFile)
    return true
  } catch (e) {
    return false
  }
}

export function changePath(pathEnv, change) {
  pathEnv = pathEnv
    .split(path.sep)
    .join('/')
    .replace(config.root, '')
    .replace(/^\//, '')
    .split('/')
  pathEnv[0] = change
  return path.join(config.root, pathEnv.join('/'))
}

export function getJson(pathJson) {
  let json = {}

  try {
    var stat = fse.statSync(pathJson)
    if (stat) {
      json = fse.readJsonSync(pathJson)
    }
  } catch (e) {
    json = {}
  }

  return json
}

/**
 * This method checks that the path leads to a file and return the content as UTF-8 content
 * @param  {string} path The path
 * @return {string}      The content of the UTF-8 file
 */
export function getContent(pathFile) {
  var res = null
  if (typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
    if (exist(pathFile)) {
      res = fse.readFileSync(pathFile, 'utf8')
    }
  }
  return res
}

/**
 * synchronous fse walker to get folders with recursive option
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFoldersSync(dirname, recursive = true) {
  let items = []
  try {
    fse.readdirSync(dirname).map(function(fileName) {
      let pathFile = path.join(dirname, fileName)
      let stat = fse.statSync(pathFile)
      if (stat.isDirectory()) {
        let directory = {path: pathFile, folders: []}
        if (recursive) {
          directory.folders = coreUtils.file.getFoldersSync(pathFile, recursive)
        }
        items.push(directory)
      }
    })

    return items
  } catch (e) {
    return items
  }
}

/**
 * Promisified fse walker to get folders with recursive option
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFoldersAsync(dirname, recursive = true) {
  let items = []
  return fse
    .readdirAsync(dirname)
    .map(function(fileName) {
      let pathFile = path.join(dirname, fileName)
      return fse.statAsync(pathFile).then(function(stat) {
        if (stat.isDirectory()) {
          let directory = {path: pathFile, folders: []}

          if (recursive) {
            return coreUtils.file
              .getFoldersAsync(pathFile, recursive)
              .then(function(filesInDir) {
                directory.folders = filesInDir
                items.push(directory)
              })
          } else {
            items.push(directory)
          }
        }
        return
      })
    })
    .then(function() {
      return items
    })
}

/**
 * synchronous fse walker with recursive and extension options
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFilesSync(dirname, recursive = true, filterExt = '') {
  let items = []
  try {
    fse.readdirSync(dirname).map(function(fileName) {
      let pathFile = path.join(dirname, fileName)
      let stat = fse.statSync(pathFile)
      if (stat.isFile()) {
        let extFile = path.extname(fileName)
        if (filterExt === '' || extFile === filterExt) {
          items.push(pathFile)
        }
      }
      if (stat.isDirectory() && recursive) {
        let filesInDir = coreUtils.file.getFilesSync(
          pathFile,
          recursive,
          filterExt
        )
        items = items.concat(filesInDir)
      }
    })

    return items
  } catch (e) {
    return items
  }
}

/**
 * Promisified fse walker with recursive and extension options
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export async function getFiles(dirname, recursive = true, filterExt = '') {
  let items = []

  try {
    let stat = await fse.lstat(dirname)
    if (stat.isDirectory()) {
      let files = await fse.readdir(dirname)
      await Promise.all(files.map(async fileName => {
        let pathFile = path.join(dirname, fileName)
        let statFile = await fse.stat(pathFile)
        if (statFile.isFile()) {
          let extFile = path.extname(fileName)
          if (filterExt === '' || extFile === filterExt) {
            items.push(pathFile)
          }
        }
        if (recursive) {
          let filesInDir = await coreUtils.file.getFiles(pathFile, recursive, filterExt)
          items = items.concat(filesInDir)
        }
      }));
    }
  } catch (e) {
    // We don't throw no error. the directory or file doesn't exist
  }

  return items
}

export function addFolder(folderPath) {
  mkdirp(path.join(config.root, folderPath), function(err) {
    if (err) console.error(err)
  })
  return folderPath
}

export function removeFolder(folderPath) {
  fse.remove(path.join(config.root, folderPath), function(err) {
    if (err) return console.error(err)
  })
  return folderPath
}

/**
 * Return the date of the revision
 * @param  {String}  revisionPath   url of the post revision
 * @return {Date}    date           Date object
 */
export function getDate(revisionPath) {
  var date = cmsData.fileAttr.get(revisionPath).d

  if (typeof date === 'undefined' || date === null || date === '') {
    date = new Date()
  } else {
    date = new Date(date)
  }

  return date
}

/**
 *
 * @param  {String}  revisionPath   url of the post revision
 * @return {Date}    date           Date object
 */
export function addDateIsoToRevisionPath(revisionPath, type) {
  var dateISO
  var saveJsonFile = revisionPath

  if (type === 'publish') {
    return revisionPath
  }

  dateISO =
    type[0] +
    cmsData.revision.removeStatusAndDateFromFileName(new Date().toISOString())

  if (dateISO) {
    saveJsonFile = cmsData.fileAttr.add(saveJsonFile, dateISO)
  }

  return saveJsonFile
}
