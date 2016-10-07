import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import moment from 'moment'
import path from 'path'

import {
  cmsData
  ,cmsOperations
	,coreUtils
	,config
  ,Hooks
  ,Manager
} from '../../'

export default class FileParser {

  constructor() {}

  static read(base, dirName, type, flatten, extensions = /(.*?)/, max = 99, current = 0, inversePattern = false) {
    var arr = []
    var level = fse.readdirSync(dirName)
    var fileCurrentLevel = []
    let assets = config.files.templates.assets

    for (var i = 0; i < level.length; i++) {
      var pathLevel = dirName + '/' + level[i]
      var isFolder = true
      try {
        var directory = fse.lstatSync(pathLevel)
        if (!directory.isDirectory()) {
          isFolder = false
        }
      } catch (e) {
        isFolder = false
      }
      var match = (isFolder) ? true : (inversePattern) ? !extensions.test(level[i]) : extensions.test(level[i])
      if((type === 'files' || type === null) && match) {

        if(level[i].indexOf('.') > -1) {
          var extension = /(\.[\s\S]*)/.exec(level[i])[0]
          var cleanName = cmsData.fileAttr.delete(level[i])
          var cleanNameNoExt = cleanName.replace(/\..+$/, '')
          var fileData = cmsData.fileAttr.get(level[i])

          var date
          if (fileData.d) {
            date = fileData.d
          }else {
            var stat = fse.statSync(pathLevel)
            date = stat.mtime
          }
          var cleanFilePath = cmsData.fileAttr.delete(pathLevel).replace(config.root, '').replace(/^\/?.+?\//, '')

          var fileDate = moment(date)
          var duration = moment.duration(moment(fileDate).diff(new Date())).humanize(true)

          var filePath = pathLevel.replace(config.root, '')
          filePath = filePath.split('/')
          filePath.shift()
          filePath = filePath.join('/')
          var item = {
            'name': level[i],
            'path': pathLevel,
            'cleanPathName': cmsData.fileAttr.delete(pathLevel),
            'cleanPath': pathLevel.replace(base + '/', ''),
            date: date,
            cleanDate: fileDate.format('YYYY/MM/DD HH:MM:ss'),
            duration: duration,
            cleanName: cleanName,
            cleanNameNoExt: cleanNameNoExt,
            cleanFilePath: cleanFilePath,
            filePath: filePath,
            'type': 'file',
            'fileType': extension
          }

          if(!flatten) item['folders'] = []
          arr.push(item)
  		      // push current file name into array to check if siblings folder are assets folder
          fileCurrentLevel.push(level[i].replace(/\..+$/, '') + assets)
        }
      }
      if(!fileCurrentLevel.includes(level[i]) && match) {
        if(isFolder) {
          if(!flatten) {
            var index = arr.push({'name': level[i], 'path': pathLevel, 'cleanPath': pathLevel.replace(base + '/', ''), 'folders': [], 'type': 'folder'}) - 1
            if(current < max){
              arr[index].folders = FileParser.read(base, pathLevel, type, flatten, extensions, max, current + 1, inversePattern)
            }
          }else {
            if(type === 'folders' || type === null) {
              arr.push({'name': level[i], 'path': pathLevel, 'cleanPath': pathLevel.replace(base + '/', ''), 'type': 'folder'})
            }
            if(current < max){
              Array.prototype.forEach.call(FileParser.read(base, pathLevel, type, flatten, extensions, max, current + 1, inversePattern), (files) => {
                arr.push(files)
              })
            }
          }
        }
      }
    }

    return arr
  }

  static getFolders(folder, flatten, level) {
    var arr = []
    flatten = flatten || false
    arr = FileParser.read(folder.replace(/\/$/, ''), folder.replace(/\/$/, ''), 'folders', flatten, /(.*?)/, level)
    return arr
  }
  
  static getFiles(folder, flatten, level, extensions = /(.*?)/, inversePattern = false) {
    var arr = []
    flatten = flatten || false
    arr = FileParser.read(folder.replace(/\/$/, ''), folder.replace(/\/$/, ''), 'files', flatten, extensions, level, 0, inversePattern)

    return arr
  }

  static getFilesByType(pathFile, type = null) {
    try {
      var directory = fse.lstatSync(pathFile)
      if (!directory.isDirectory()) {
        mkdirp.sync(pathFile)
      }
    } catch (e) {
      mkdirp.sync(pathFile)
    }
    var files = FileParser.getFiles(pathFile, true, 20, new RegExp(`.${config.files.templates.extension}`))

    var result = []

    Array.prototype.forEach.call(files, (file) => {
      var val = cmsData.fileAttr.get(file.path).s
      if(type === null || val === type) result.push(file)
    })
    return result
  }

  static changePathEnv(pathEnv, change) {
    pathEnv = pathEnv.replace(config.root, '').replace(/^\//, '').split('/')
    pathEnv[0] = change

    return path.join(config.root, pathEnv.join('/'))
  }

  /**
   * This function makes sorting on an array of Json objects possible.
   * Pass the property to be sorted on.
   * Usage: myArray.sort(FileParser.predicatBy('date',-1));
   * @param  String prop  the json property to sort on
   * @param  integer order order ASC if 1, DESC if -1
   * @return integer the ordered value
   */
  static predicatBy(prop, order){
    if (order !== -1) {
      order = 1
    }
    if(prop === 'date'){
      return function(a,b){
        a = new Date(a[prop])
        b = new Date(b[prop])
        if( a > b){
          return 1*order
        }else if( a < b ){
          return -1*order
        }
        return 0
      }
    }

    return function(a,b){
      if( a[prop] > b[prop]){
        return 1*order
      }else if( a[prop] < b[prop] ){
        return -1*order
      }
      return 0
    }
  }
}