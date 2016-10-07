import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'
import path from 'path'
import {
	cmsData,
	FileParser,
	config
} from '../../'

export default class FileUtils {

  constructor() {}

	/**
	 * concatenate strings into a path. Each string being appended with a "/"
	 * @param  {array} array of strings to be concatenated
	 * @return {string} path as the result of concatenation
	 */
  static concatPath() {
    var cpath = ''
    Array.prototype.forEach.call([].slice.call(arguments), (argument) => {
      if(cpath !== '') argument = argument.replace(/^\//, '')
      if(argument !== '') cpath += argument.replace(/\/$/, '') + '/'
    })

    cpath = cpath.replace(/\/$/, '')

    return cpath
  }

	/**
	 * Remove the last segment of the path (ie. /the/path/to => /the/path)
	 * @param  {string} path the path
	 * @return {string}      The path with the last segment removed
	 */
  static removeLast(pathRemove) {

    return pathRemove.substring(0, pathRemove.replace(/\/$/, '').lastIndexOf('/'))
  }

	/**
	 * Replace the extension in the path (ie. /the/path/to/file.txt => /the/path/to/file.json)
	 * @param  {string} path The path
	 * @param  {string} ext  The extension to put as a replacement
	 * @return {string}      The path with the new extension
	 */
  static replaceExtension(path, ext) {

    return path.substring(0, path.lastIndexOf('.')) + '.' + ext
  }

	/**
	 * Remove the extension from the path if any
	 * @param  {string} path The path
	 * @return {string}      The path without extension
	 */
  static removeExtension(path) {
    if (path.lastIndexOf('.') > -1) {
      return path.substring(0, path.lastIndexOf('.'))
    }
    return path
  }

	/**
	 * Extract the filename from the path (ie. /the/path/to/file.json => file.json)
	 * @param  {string} path The path
	 * @return {string}      The filename extracted from the path
	 */
  static filename(path) {

    return path.replace(/\/$/, '').substring(path.replace(/\/$/, '').lastIndexOf('/') + 1)
  }

	/**
	 * Check if the path given coreespond to an existing file
	 * @param  {string}  path The path
	 * @return {Boolean}      Does the file exist
	 */
  static isFile(path) {
    try{
      var stat = fse.statSync(path)

      return true
    }catch(e){

      return false
    }

    return false
  }

	/**
	 * Create the directory if it doesn't exist and create the json file
	 * @param  {string} path The path
	 * @param  {string} json The Json data
	 */
  static writeJson(path, json) {
    mkdirp(FileUtils.removeLast(path))
    fse.writeJsonSync(path, json, { space: 2, encoding: 'utf-8' })
  }

  static removeFile(file) {
    fse.removeSync(file)
  }

	/**
	 * Check if the string given has an extension
	 * @param  {string}  fileName the filename to check
	 * @return {Boolean}          Wether the filename has an extension or not
	 */
  static isValidFile(fileName) {
    var dotPosition = fileName.indexOf('.')
    if(dotPosition > 0) return true

    return false
  }

	/* TODO: put this method in the right helper */
  static cleanTplName(pathClean) {
    var cleanTplName = cmsData.fileAttr.delete(pathClean)
    cleanTplName = cleanTplName.replace(config.root, '')
    cleanTplName = cleanTplName.split('/')
    cleanTplName.shift()
    return cleanTplName.join('/')
  }

	/* TODO: Remove this method and replace it with the previous one */
  static cleanFilePath(pathClean) {
    var cleanFilePath = cmsData.fileAttr.delete(pathClean)
    cleanFilePath = cleanFilePath.replace(config.root, '')
    cleanFilePath = cleanFilePath.split('/')
    cleanFilePath.shift()
    return cleanFilePath.join('/')
  }

	
	/* TODO: put this method in the right helper */
  static getFilePath(pathFile) {
    var res = null
    if(typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
      res = pathFile.replace(config.root)
      res = path.join(config.root, config.draft.url, res)
    }
    return res
  }

  /* TODO: refactor this method as Facade method to a method adding a fragment in a path */
  static getTemplatePath(pathTemplate) {
    if (pathTemplate.indexOf('.') === -1) { // no extension add one
      pathTemplate = `${pathTemplate}.${config.files.templates.extension}`
    }

    var res = null
    if(typeof pathTemplate !== 'undefined' && pathTemplate !== null && pathTemplate !== '') {
      res = pathTemplate.replace(config.root)
      res = path.join(config.root, config.templates.url, res)
    }
    return res
  }

  /**
   * This method checks that the path leads to a file and return the content as UTF-8 content
   * @param  {string} path The path
   * @return {string}      The content of the UTF-8 file
   */
  static getFileContent(path) {
    var res = null
    if(typeof path !== 'undefined' && path !== null && path !== '') {
      if (FileUtils.isFile(path)) {
        res = fse.readFileSync(path, 'utf8')
      }
    }
    return res
  }

  /* TODO: put this method in its right helper */
  static deleteOlderRevisionByType(fileName, type) {
    var folder = fileName.split('/')
    var file = folder.pop()
    var extension = file.replace(/.*?\./, '')
    folder = folder.join('/')
    var stat = fse.statSync(folder)
    if(stat){
      var files = FileParser.getFiles(folder, true, 1, new RegExp('\\.' + extension))
      files.forEach(function (fileItem) {
        var fname = cmsData.fileAttr.delete(fileItem.cleanPath)
        var ftype = cmsData.fileAttr.get(fileItem.cleanPath).s
        if(fname === file && ftype === type){
          var fileDraft = fileItem.path.replace(/-abe-./, '-abe-d')
          FileParser.removeFile(fileItem.path, FileParser.changePathEnv(fileItem.path, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
          FileParser.removeFile(fileDraft, FileParser.changePathEnv(fileDraft, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
        }
      })
    }
  }

}
