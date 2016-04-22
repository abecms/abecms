import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'

import {
	cli,
	log,
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
	static pathWithRoot(path) {
		if(typeof path === 'undefined' || path === null || path === '') path = ''
		return FileUtils.concatPath(config.root, path.replace(config.root, '')).replace(/\/$/, "")
	}

	/**
	 * [cleanPath remove the trailing slash in the path
	 * @param  {string} path The path to be cleaned
	 * @return {string}      The path with no trailing slash
	 */
	static cleanPath(path) {
		if(typeof path !== 'undefined' && path !== null) path = path.replace(/\/$/, "")
		return path
	}

	/**
	 * concatenate strings into a path. Each string being appended with a "/"
	 * @param  {array} array of strings to be concatenated
	 * @return {string} path as the result of concatenation
	 */
	static concatPath() {
		var path = ''
		Array.prototype.forEach.call([].slice.call(arguments), (argument) => {
			if(path !== '') argument = argument.replace(/^\//, "")
			if(argument !== '') path += FileUtils.cleanPath(argument) + '/'
		})

		path = FileUtils.cleanPath(path)

		return path
	}

	/**
	 * Remove the last segment of the path (ie. /the/path/to => /the/path)
	 * @param  {string} path the path
	 * @return {string}      The path with the last segment removed
	 */
	static removeLast(path) {

		return path.substring(0, FileUtils.cleanPath(path).lastIndexOf('/'))
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

		return path.substring(0, path.lastIndexOf('.'))
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
	static cleanTplName(path) {
		var cleanTplName = fileAttr.delete(path)
		cleanTplName = cleanTplName.replace(config.root, '')
		cleanTplName = cleanTplName.split('/')
		cleanTplName.shift()
		return cleanTplName.join('/')
	}

	/* TODO: Remove this method and replace it with the previous one */
	static cleanFilePath(path) {
		var cleanFilePath = fileAttr.delete(path)
		cleanFilePath = cleanFilePath.replace(config.root, '')
		cleanFilePath = cleanFilePath.split('/')
		cleanFilePath.shift()
		return cleanFilePath.join('/')
	}

	
	/* TODO: put this method in the right helper */
  static getFilePath(path) {
  	var res = null
  	if(typeof path !== 'undefined' && path !== null && path !== '') {
  		res = path.replace(config.root)
  		res = FileUtils.concatPath(config.root, config.draft.url, res)
  	}
  	return res
  }

  /* TODO: refactor this method as Facade method to a method adding a fragment in a path */
  static getTemplatePath(path) {
  	var res = null
  	if(typeof path !== 'undefined' && path !== null && path !== '') {
  		res = path.replace(config.root)
  		res = FileUtils.concatPath(config.root, config.templates.url, res)
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
  		var files = FileParser.getFiles(folder, true, 1, new RegExp("\\." + extension))
  		files.forEach(function (fileItem) {
  			var fname = fileAttr.delete(fileItem.cleanPath)
  			var ftype = fileAttr.get(fileItem.cleanPath).s
  			if(fname === file && ftype === type){
  				var fileDraft = fileItem.path.replace(/-abe-./, '-abe-d')
  				FileParser.removeFile(fileItem.path, FileParser.changePathEnv(fileItem.path, config.data.url).replace(new RegExp("\\." + extension), '.json'))
  				FileParser.removeFile(fileDraft, FileParser.changePathEnv(fileDraft, config.data.url).replace(new RegExp("\\." + extension), '.json'))
  			}
  		})
  	}
  }

  /* TODO: put this method in its right helper */
  static checkMergedFile(file, merged) {
  	var cleanFilePath = file.cleanFilePath
		var revision = {
  			status: file.status,
  			filePath: file.filePath,
  			date: file.abe_meta.latest.date,
				template: file[config.meta.name].template,
  			cleanFilePath: cleanFilePath
		}
		revision[config.meta.name] = file[config.meta.name]

		if(typeof merged[cleanFilePath] === 'undefined' || merged[cleanFilePath] === null) {
			merged[cleanFilePath] = {}

			merged[cleanFilePath].cleanFilePath = revision.cleanFilePath
			merged[cleanFilePath].date = revision.date
			merged[cleanFilePath].template = revision.template
			merged[cleanFilePath][config.meta.name] = revision[config.meta.name]
			merged[cleanFilePath][file.status] = revision
		}else {
			var oldDate = new Date(merged[cleanFilePath].date)
			var newDate = new Date(revision.date)
			var oldStatus = ''
			if(typeof merged[cleanFilePath][revision.status] !== 'undefined' && merged[cleanFilePath][revision.status] !== null) {
				oldStatus = merged[cleanFilePath][revision.status].status
			}
			var newStatus = revision.status

			// if draft > publish
			if(typeof merged[cleanFilePath][newStatus] === 'undefined' || merged[cleanFilePath][newStatus] === null) {
				merged[cleanFilePath][newStatus] = revision
			}else if(newDate > oldDate && oldStatus === newStatus) {
				merged[cleanFilePath][file.status] = revision
			}
		}
  }
  
  /* TODO: put this method in its right helper */
  static mergeFiles(files1, files2) {
  	var merged = {}
  	var arMerged = []
		
  	Array.prototype.forEach.call(files1, (file) => {
  		FileUtils.checkMergedFile(file, merged)
  	})

  	Array.prototype.forEach.call(files2, (file) => {
  		FileUtils.checkMergedFile(file, merged)
  	})

  	Array.prototype.forEach.call(Object.keys(merged), (key) => {
  		var merge = merged[key]
  		var publishedDate = (typeof merge.published !== 'undefined' && merge.published !== null) ? new Date(merge.published.date) : null
  		var draftDate = (typeof merge.draft !== 'undefined' && merge.draft !== null) ? new Date(merge.draft.date) : null

  		if(publishedDate !== null && draftDate !== null && publishedDate >= draftDate) {
  			merge.draft = null
  		}
  		var revision = {
  			path: merge.cleanFilePath,
  			template: merge.template,
  			published: merge.published,
  			date: merge.date,
  			draft: merge.draft
  		}
  		arMerged.push(revision)
  	})

  	return arMerged
  }

}
