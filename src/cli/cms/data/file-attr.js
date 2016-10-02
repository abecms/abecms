import fse from 'fs-extra'
import path from 'path'
import {
  cli
  ,FileParser
  ,fileUtils
  ,dateUnslug
  ,config
  ,Manager
} from '../../'

var fullAttr = '-abe-(.+?)(?=\.'
var captureAttr = '-abe-(.+?)(?=\.'
var oneAttr = ['[\\|]?', '=(.)*?(?=[\||\\]])']

/**
 * Class Attr
 * Work string to manage string attributes key/value
 */
class Attr {

  /**
   * @param  {String} str string to work with
   * @return {void}
   */
  constructor(str) {
    this.str = str
    this.val = {}
    this.extract()
  }

  /**
   * @return {Object} attributs extracted from string as an object
   */
  extract() {
    var rex = new RegExp(captureAttr + this.getExtention() + ')')
    if(rex.test(this.str)) {
      var arrAttr = this.str.match(rex)[0].replace('-abe-', '')
      this.val = {'s': arrAttr[0], 'd': dateUnslug(arrAttr.slice(1), this.str)}
    }
    return this.val
  }

  /**
   * @return {String} str without an attributs
   */
  remove() {
    return this.str.replace(new RegExp(fullAttr + this.getExtention() + ')'), '')
  }
 
  getExtention(){
    var ext = this.str.split('.')
    return ext[ext.length - 1]
  }

  /**
   * Insert attributs to the string
   * @param  {String} string composed of a status (ex: v for validate, d for draft ...) and a date
   * @return {String} the new string with added attributs
   */
  insert(newValues) {
    var strWithoutAttr = this.remove()
    strWithoutAttr = strWithoutAttr.replace(new RegExp('\\.' + this.getExtention()), '')
    return strWithoutAttr + '-abe-' + newValues + '.' + this.getExtention()
  }

}

/**
 * Class FileAttr
 * Manage string with attributs encoded inside
 */
export default class FileAttr {

  /**
   * Add attributs or modify them if they already exists
   * @param {String} str the string to modify
   * @param {Object} options object with attributs to add
   * @return {String} the string with the new attributs
   */
  static add(str, options) {
    var attr = new Attr(str)
    return attr.insert(options)
  }

  /**
   * Remove attributs from string
   * @param {String} str the string to modify
   * @return {String} the string modified
   */
  static delete(str) {
    return new Attr(str).remove()
  }

  /**
   * @param  {String} str the string to get attributs from
   * @return {object|String} object (all the attributs) if the key is null, if not the value of the atrtibuts
   */
  static get(str) {
    return new Attr(str).val
  }

  /**
   * @param  {String} str the string to test attributs from
   * @return {boolean} true if string has attr
   */
  static test(str) {
    var att = new Attr(str).val
    return (typeof att.s !== 'undefined' && att.s !== null)
  }

  static getFilesRevision(urls, fileName) {
    var res = []
    var number = 1
    var tplUrl = FileParser.getFileDataFromUrl(fileName)
    fileName = fileName.split('/')
    fileName = fileName[fileName.length - 1]
    var publishDate = new Date()
    var json = null

    if(fileUtils.isFile(tplUrl.publish.json)) {
      json = FileParser.getJson(tplUrl.publish.json)
      if(typeof json !== 'undefined' && json !== null
        && typeof json[config.meta.name] !== 'undefined' && json[config.meta.name] !== null) {
        publishDate = new Date(json[config.meta.name].latest.date)
      }
    }

    var publishVersion = false
    urls.forEach(function (urlObj) {
      var fileData = FileAttr.get(urlObj.cleanPath)
      if(fileData.s === 'd' && FileAttr.delete(urlObj.cleanPath) == FileAttr.delete(fileName)) {
        var currentDate = new Date(urlObj.date)
        if(currentDate.getTime() > publishDate.getTime()) {
          if(!publishVersion && typeof res[res.length - 1] !== 'undefined' && res[res.length - 1] !== null) {
            res[res.length - 1].publishedDate = 'same'
          }
          publishVersion = true
          urlObj.publishedDate = 'after'
          
        }else if(currentDate.getTime() === publishDate.getTime()) {
          urlObj.publishedDate = 'same'
          publishVersion = true
        }else {
          urlObj.publishedDate = 'before'
        }
        urlObj.version = number
        number = number + 1

        var tplUrlObj = FileParser.getFileDataFromUrl(urlObj.path)
        if(fileUtils.isFile(tplUrlObj.publish.json)) {
          var jsonObj = FileParser.getJson(tplUrlObj.publish.json)
          urlObj[config.meta.name] = jsonObj[config.meta.name]
        }
        res.push(urlObj)
      }
    })
    return res
  }

  static sortByDateDesc(a, b) {
    var dateA = new Date(a.date)
    var dateB = new Date(b.date)
    if(dateA < dateB) {
      return 1
    }else if(dateA > dateB) {
      return -1
    }
    return 0
  }

  /**
   * Filter and array of file path and return the latest version of those files
   * @param  {Object} urls object with path to file, filename etc ...
   * @param  {String} type (draft|waiting|valid)
   * @return {Object} urls object filtered
   */
  static getVersions(docPath) {
    var files = Manager.instance.getList()
    var fileWithoutExtension = docPath.replace('.' + config.files.templates.extension, '.json')

    var result = []
    Array.prototype.forEach.call(files, (file) => {
      if (file.path.indexOf(fileWithoutExtension) > -1) {
        result = file.revisions
      }
    })
    return result
  }

  /**
   * Return the revision from document html file path
   * if the docPath contains abe revision [status]-[date] will try to return this revision
   * else it will return the latest revision
   * or null
   * 
   * @param  {String} html path
   * @return {Object} file revision | null
   */
  static getDocumentRevision(docPath) {
    var result = null
    var documentPath = docPath
    var latest = true
    if(FileAttr.test(documentPath)){
      latest = false
      documentPath = FileAttr.delete(documentPath)
    }
    var revisions = FileAttr.getVersions(documentPath)
    if (latest && revisions.length >= 0) {
      result = revisions[0]
    }else if (!latest) {
      Array.prototype.forEach.call(revisions, (revision) => {
        if (revision.html === docPath) {
          result = revision
        }
      })
      if (result === null && revisions.length >= 0) {
        result = revisions[0]
      }
    }
    return result
  }

  /**
   * Filter and array of file path and return the latest version of those files
   * @param  {Object} urls object with path to file, filename etc ...
   * @param  {String} type (draft|waiting|valid)
   * @return {Object} urls object filtered
   */
  static filterLatestVersion(urls, type = '') {
    var typeStr = ''
    switch(type){
    case 'draft': typeStr = 'd'; break
    default: typeStr = type[0]; break
    }
    return FileAttr.filter(urls, 'latest', typeStr)
  }

  /**
   * Filter and array of file 
   * @param  {[type]} urlsArr urls object with path to file, filename etc ...
   * @param  {[type]} filter filter to use
   * @param  {String} type
   * @return {Object} urls object filtered
   */
  static filter(urlsArr, filter, type = '') {
    var latest = []
    var result = []


    urlsArr.forEach(function (urlObj) {

      var realFileName = FileAttr.delete(urlObj.cleanPath)
      var cleanPath = urlObj.cleanPath
      var currentAttrDate = FileAttr.get(urlObj.cleanPath)
      
      if(currentAttrDate.s === type){
        if(typeof latest[realFileName] !== 'undefined' && latest[realFileName] !== null){
          switch(filter){
          case 'latest': 
            var savedAttrDate = FileAttr.get(latest[realFileName].cleanPath)
            var dateSavedUrl = new Date(savedAttrDate.length > 1 ? savedAttrDate : 0)
            var dateCurrentUrl = new Date(currentAttrDate.d.length > 1 ? currentAttrDate.d : 0)
            if(dateSavedUrl < dateCurrentUrl) latest[realFileName] = urlObj
            break
          }
        }
        else {
          latest[realFileName] = urlObj
        }
      }
    })

    for (var prop in latest) {
      result.push(latest[prop])
    }

    return result
  }

  static getLatestRevision(filePath) {
    let draft = config.draft.url
    var folder = fileUtils.removeLast(filePath)
    var fileName = filePath.replace(folder + '/', '')
    folder = folder.replace(config.root, '')

    folder = FileParser.changePathEnv(path.join(config.root, folder), draft)

    var arr = FileParser.getFiles(folder, true, 0)
    var sameFiles = []
    Array.prototype.forEach.call(arr, (item) => {
      if(item.cleanName === fileName) {
        sameFiles.push(item)
      }
    })

    var latest = FileAttr.filter(sameFiles, 'latest', 'd')
    if(typeof latest !== 'undefined' && latest !== null
      && latest.length > 0) {
      return latest[0]
    }
    return null
  }
}

