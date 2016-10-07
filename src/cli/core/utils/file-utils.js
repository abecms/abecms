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
