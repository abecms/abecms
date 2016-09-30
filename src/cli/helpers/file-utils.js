import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'
import path from 'path'
import {
	fileAttr,
	FileParser,
	config
} from '../'

export default class FileUtils {

  constructor() {}

	/**
	 * Prepend the path with the root path
	 * @param  {string} path The path to be prepended
	 * @return {string}      The path prepended with the root path
	 */
  static pathWithRoot(ppath) {
    if(typeof ppath === 'undefined' || ppath === null || ppath === '') ppath = ''
    return path.join(config.root, ppath.replace(config.root, '')).replace(/\/$/, '')
  }

	/**
	 * [cleanPath remove the trailing slash in the path
	 * @param  {string} path The path to be cleaned
	 * @return {string}      The path with no trailing slash
	 */
  static cleanPath(cpath) {
    if(typeof cpath !== 'undefined' && cpath !== null) cpath = cpath.replace(/\/$/, '')
    return cpath
  }

	/**
	 * concatenate strings into a path. Each string being appended with a "/"
	 * @param  {array} array of strings to be concatenated
	 * @return {string} path as the result of concatenation
	 */
  static concatPath() {
    var cpath = ''
    Array.prototype.forEach.call([].slice.call(arguments), (argument) => {
      if(cpath !== '') argument = argument.replace(/^\//, '')
      if(argument !== '') cpath += FileUtils.cleanPath(argument) + '/'
    })

    cpath = FileUtils.cleanPath(cpath)

    return cpath
  }

	/**
	 * Remove the last segment of the path (ie. /the/path/to => /the/path)
	 * @param  {string} path the path
	 * @return {string}      The path with the last segment removed
	 */
  static removeLast(pathRemove) {

    return pathRemove.substring(0, FileUtils.cleanPath(pathRemove).lastIndexOf('/'))
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

    return FileUtils.cleanPath(path).substring(FileUtils.cleanPath(path).lastIndexOf('/') + 1)
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
    var cleanTplName = fileAttr.delete(pathClean)
    cleanTplName = cleanTplName.replace(config.root, '')
    cleanTplName = cleanTplName.split('/')
    cleanTplName.shift()
    return cleanTplName.join('/')
  }

	/* TODO: Remove this method and replace it with the previous one */
  static cleanFilePath(pathClean) {
    var cleanFilePath = fileAttr.delete(pathClean)
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
        var fname = fileAttr.delete(fileItem.cleanPath)
        var ftype = fileAttr.get(fileItem.cleanPath).s
        if(fname === file && ftype === type){
          var fileDraft = fileItem.path.replace(/-abe-./, '-abe-d')
          FileParser.removeFile(fileItem.path, FileParser.changePathEnv(fileItem.path, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
          FileParser.removeFile(fileDraft, FileParser.changePathEnv(fileDraft, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
        }
      })
    }
  }
  
  /* TODO: put this method in its right helper */
  static getFilesMerged(files) {
    var merged = {}
    var arMerged = []
		
    Array.prototype.forEach.call(files, (file) => {
      var cleanFilePath = file.cleanFilePath

      var fileStatusIsPublish = fileAttr.get(file.cleanPath)
      if(typeof fileStatusIsPublish.s !== 'undefined' && fileStatusIsPublish.s !== null && file.abe_meta.status === 'publish') {
        file.abe_meta.status = 'draft'
      }

      file.html = path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`))
      if (file.abe_meta.status === 'publish') {
        file.htmlPath = path.join(config.root, config.publish.url, path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))
      }else {
        file.htmlPath = path.join(config.root, config.draft.url, path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))
      }

      if(typeof merged[cleanFilePath] === 'undefined' || merged[cleanFilePath] === null) {
        merged[cleanFilePath] = {
          name: fileAttr.delete(file.name)
					, path: fileAttr.delete(file.path)
					, html: fileAttr.delete(path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))
					, htmlPath: path.join(config.root, config.publish.url, path.join('/', fileAttr.delete(file.filePath.replace(/\.json/, `.${config.files.templates.extension}`))))
					, cleanPathName: file.cleanPathName
					, cleanPath: file.cleanPath
					, cleanName: file.cleanName
					, cleanNameNoExt: file.cleanNameNoExt
					, cleanFilePath: file.cleanFilePath
					, filePath: fileAttr.delete(file.filePath)
					, revisions: []
        }
      }

      merged[cleanFilePath].revisions.push(JSON.parse(JSON.stringify(file)))
    })

    // return merged
    Array.prototype.forEach.call(Object.keys(merged), (key) => {
      var revisions = merged[key].revisions
      revisions.sort(FileParser.predicatBy('date', -1))
      if(typeof revisions[0] !== 'undefined' && revisions[0] !== null) {
        merged[key].date = revisions[0].date
      }

      Array.prototype.forEach.call(revisions, (revision) => {
				
        var status = revision.abe_meta.status

        if (status === 'publish') {
          merged[key][status] = revision
        }else {
          merged[key][status] = {}
        }
        merged[key][status].path = revision.path
        merged[key][status].html = revision.html
        merged[key][status].htmlPath = revision.htmlPath
        merged[key][status].date = new Date(revision.date)
        merged[key][status].link = revision.abe_meta.link
      })

      merged[key].revisions = revisions

      merged[key].date = revisions[0].date
      merged[key].cleanDate = revisions[0].cleanDate
      merged[key].duration = revisions[0].duration
      merged[key].abe_meta = revisions[0].abe_meta

      arMerged.push(merged[key])
    })

    return arMerged
  }

}
