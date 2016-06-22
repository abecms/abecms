import fse from 'fs-extra'
import clc from 'cli-color'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'

import {
	cli
	,log
	,folderUtils
	,fileUtils
	,fileAttr
	,config
	,Hooks
	,Plugins
} from '../'

export default class FileParser {

	constructor() {}

	static getWebsite(path) {
		var beforeRoot = config.root.split('/')
		beforeRoot = beforeRoot.pop()
		var website = beforeRoot
		return website.split('/')[0]
	}

	static getTemplate(path) {
		var file = path.replace(config.root, '')
		var file = path.replace(config.templates.url, '')
		return file.replace(/^\//, "")
	}

	static getType(path) {
		var folders = path.replace(config.root, '')
		folders = folders.replace(/^\//, "")
		return folders.split('/')[0]
	}

	static read(base, dirName, type, flatten, extensions = /(.*?)/, max = 99, current = 0) {
		var website = config.root.split('/')
		website = website[website.length - 1]
		var arr = []
		var level = fse.readdirSync(dirName)
		var fileCurrentLevel = []
		let assets = config.files.templates.assets

	  // read file first
	  for (var i = 0; i < level.length; i++) {
	  	var path = dirName + '/' + level[i]
	  	var match = (isFolder) ? true : extensions.test(level[i])
	  	if((type === 'files' || type === null) && match) {
	    	if(fileUtils.isValidFile(level[i])) {
		    	var extension = /(\.[\s\S]*)/.exec(level[i])[0]
		    	var cleanName = fileAttr.delete(level[i])
		    	var cleanNameNoExt = fileUtils.removeExtension(cleanName)
		    	var fileData = fileAttr.get(level[i])
		    	var date = fileData.d ? fileData.d : '0000-00-00T00:00:00.000Z'
		    	var status = fileData.s ? dirName.replace(config.root, '').replace(/^\//, '').split('/')[0] : 'published'
		    	var cleanFilePath = fileUtils.cleanFilePath(path)

		    	var fileDate = fileDate = moment(date)
		    	var duration = moment.duration(moment(fileDate).diff(new Date())).humanize(true)

		    	var filePath = path.replace(config.root, '')
		    	filePath = filePath.split('/')
		    	filePath.shift()
		    	filePath = filePath.join('/')
		    	var item = {
						'name': level[i],
						'path': path,
						'website': website,
						'cleanPathName': fileAttr.delete(path),
						'cleanPath': path.replace(base + '/', ''),
						date: date,
						cleanDate: fileDate.format("YYYY/MM/DD HH:MM:ss"),
						duration: duration,
						status: status,
	      		cleanName: cleanName,
	      		cleanNameNoExt: cleanNameNoExt,
						cleanFilePath: cleanFilePath,
						filePath: filePath,
						'type': 'file',
						'fileType': extension
					}

		    	if(!flatten) item['folders'] = [];
		      arr.push(item)
		      // push current file name into array to check if siblings folder are assets folder
		      fileCurrentLevel.push(fileUtils.removeExtension(level[i]) + assets)
	    	}
	    }
	  }

	  // read folder now
	  for (i = 0; i < level.length; i++) {
	  	var path = dirName + '/' + level[i]
	  	var isFolder = folderUtils.isFolder(path)
	  	var match = (isFolder) ? true : extensions.test(level[i])

	  	if(!fileCurrentLevel.includes(level[i]) && match) {
		  	if(isFolder) {
		      if(!flatten) {
		      	var index = arr.push({'name': level[i], 'path': path, 'website': website, 'cleanPath': path.replace(base + '/', ''), 'folders': [], 'type': 'folder'}) - 1
		      	if(current < max){
		      		arr[index].folders = FileParser.read(base, path, type, flatten, extensions, max, current++)
		      	}
		      }else {
		      	if(type === 'folders' || type === null) {
							arr.push({'name': level[i], 'path': path, 'website': website, 'cleanPath': path.replace(base + '/', ''), 'type': 'folder'})
		      	}
						if(current < max){
							Array.prototype.forEach.call(FileParser.read(base, path, type, flatten, extensions, max, current++), (files) => {
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
  	arr = FileParser.read(fileUtils.cleanPath(folder), fileUtils.cleanPath(folder), 'folders', flatten, /(.*?)/, level)
  	return arr
  }
  
  static getFiles(folder, flatten, level, extensions = /(.*?)/) {
  	var arr = []
  	flatten = flatten || false
  	arr = FileParser.read(fileUtils.cleanPath(folder), fileUtils.cleanPath(folder), 'files', flatten, extensions, level)
  	return arr
  }

  static getFilesByType(path, type = null) {
	  if(!folderUtils.isFolder(path)) {
	    mkdirp.sync(path)
	  }
	  var files = FileParser.getFiles(path, true, 20, new RegExp(`.${config.files.templates.extension}`))

	  var result = []

	  Array.prototype.forEach.call(files, (file) => {
	    var val = fileAttr.get(file.path).s
	    if(type === null || val === type) result.push(file)
	  })
	  return result
	}
  
  static getAssetsFolder(path = '') {
		var folder = fileUtils.pathWithRoot(path)
		var assetsFolders = []
  	var flatten = true
	  var site = folder

  	let templates = config.templates.url
  	let assets = config.files.templates.assets
  	var path = fileUtils.concatPath(folder, templates)

		if(folderUtils.isFolder(path)) {
	  	var arr = FileParser.read(path, path, 'files', flatten, /(.*?)/, 99)

	  	// now check if file for folder exist
	  	Array.prototype.forEach.call(arr, (file) => {
	  		var folderName = fileUtils.removeExtension(file.path) + assets
	  		if(folderUtils.isFolder(folderName)) assetsFolders.push(folderName)
			})
		}

  	return assetsFolders
  }
  
  static getAssets() {
	  var folders = FileParser.getAssetsFolder()
	  var assets = []
	  Array.prototype.forEach.call(folders, (folder) => {
			assets = assets.concat(FileParser.read(folder, folder, 'files', true, /(.*?)/, 99))
		})

  	return assets
  }

	static getProjetFiles() {
	  var site = folderUtils.folderInfos(config.root)
	  var result = {'structure': [], 'templates': []}

    let structure = config.structure.url
    let templates = config.templates.url

    if(folderUtils.isFolder(fileUtils.concatPath(site.path, structure)) && folderUtils.isFolder(fileUtils.concatPath(site.path, templates))) {
	    site.folders = FileParser.getFolders(fileUtils.concatPath(site.path, structure), false)
	    result.structure = site.folders
	    result.templates = result.templates.concat(FileParser.getFiles(fileUtils.concatPath(site.path, templates), true, 10, new RegExp(`.${config.files.templates.extension}`)))
    }

	  return result
	}

  static changePathEnv(path, change) {
  	path = path.replace(config.root, '').replace(/^\//, '').split('/')
  	path[0] = change
  	
  	return fileUtils.concatPath(config.root, path.join('/'))
  }
  
  static getFileDataFromUrl(url) {
  	var res = {
  		root: '',
  		draft: {
  			dir: '',
  			file: '',
  			path: ''
  		},
  		publish: {
  			dir: '',
  			file: '',
  			link: '',
  			path: '',
  			json: ''
  		},
  		json: {
  			path: '',
  			file: ''
  		}
  	}

  	let extension = config.files.templates.extension
  	if(typeof url !== 'undefined' && url !== null && url.indexOf('.' + extension) > -1) {

	  	var dir = fileUtils.removeLast(url).replace(config.root, '')
	  	var filename = fileUtils.filename(url)
	  	var basePath = dir.replace(config.root, '').split('/')
	  	var link = url.replace(config.root, '')
	  	link = link.split('/')
	  	link.shift()
	  	link = fileAttr.delete('/' + fileUtils.cleanPath(link.join('/')))

	  	let draft = config.draft.url
	  	let publish = config.publish.url
	  	let data = config.data.url

	  	var draftPath = FileParser.changePathEnv(fileUtils.concatPath(config.root, dir), draft)

	  	res.root = config.root

	  	// set dir path draft/json
	  	res.draft.dir = FileParser.changePathEnv(fileUtils.concatPath(config.root, dir), draft)
	  	res.json.dir = FileParser.changePathEnv(fileUtils.concatPath(config.root, dir), data)
	  	res.publish.dir = FileParser.changePathEnv(fileUtils.concatPath(config.root, dir), publish)
	  	res.publish.json = res.json.dir

	  	// set filename draft/json
	  	res.draft.file = filename
	  	res.publish.file = fileAttr.delete(filename)
	  	res.publish.link = link
	  	res.json.file = fileUtils.replaceExtension(filename, 'json')
	  	res.publish.json = fileUtils.concatPath(res.json.dir, fileAttr.delete(res.json.file))

	  	// set filename draft/json
	  	res.draft.path = fileUtils.concatPath(res.draft.dir, res.draft.file)
	  	res.publish.path = fileUtils.concatPath(res.publish.dir, res.publish.file)
	  	res.json.path = fileUtils.concatPath(res.json.dir, res.json.file)

	  	if(!fileUtils.isFile(res.json.path) && folderUtils.isFolder(res.json.dir)) {
	  		var files = fileAttr.filterLatestVersion(FileParser.getFiles(res.json.dir), 'draft')
	  		Array.prototype.forEach.call(files, (file) => {
	  			if(file.cleanName === res.json.file) res.json.path = file.path
				})
	  	}
	  	// config.workflow.forEach(function (flow) {
	  	// 	res[flow] = {
	  	// 		dir: FileParser.changePathEnv(res.publish.dir, flow),
	  	// 		file: res.publish.file,
	  	// 		link: res.publish.link,
	  	// 		path: FileParser.changePathEnv(res.publish.path, flow),
	  	// 		json: res.json.path
	  	// 	}
	  	// })
// console.log(res)
  	}
  	return res
  }

  static copySiteAssets(path) {
  	var publicFolders = FileParser.getAssetsFolder(path)
  	let publish = config.publish.url
  	var dest = fileUtils.concatPath(config.root, publish)
  	if (!folderUtils.isFolder(dest)) {
  		mkdirp.sync(dest)
  	}

		Array.prototype.forEach.call(publicFolders, (publicFolder) => {
		  var res = dircompare.compareSync(publicFolder, dest, {compareSize: true})

		  res.diffSet.forEach(function (entry) {
		    var state = {
	        'equal' : '==',
	        'left' : '->',
	        'right' : '<-',
	        'distinct' : '<>'
		    }[entry.state]

				var name1 = entry.name1 ? entry.name1 : ''
				var name2 = entry.name2 ? entry.name2 : ''

				let exclude = config.files.exclude
		    if(!exclude.test(name1) && !exclude.test(name2) && entry.type1 !== 'directory' && entry.type2 !== 'directory') {
			    
			    if(typeof entry.path1 !== 'undefined' && entry.path1 !== null) {
			      var original = entry.path1
			      var basePath = original.replace(publicFolder, '')
			      var move = fileUtils.concatPath(dest, basePath)

				    if(entry.type2 === 'missing' || entry.state === 'distinct') {
				    	fse.removeSync(move)
							var cp = fse.copySync(original, move)
				    }
			    }
		    }
			})
		})

		return publicFolders
  }

  static getMetas(arr, type) {
  	var res = []
		Array.prototype.forEach.call(arr, (file) => {
			let meta = config.meta.name

			var jsonPath = FileParser.getFileDataFromUrl(file.path).json.path
			var json = FileParser.getJson(jsonPath)
			if(typeof json[meta] === 'undefined' || json[meta] === null) json[meta] = {}
			file['template'] = json[meta].template
			if(typeof json[meta].latest !== 'undefined' && json[meta].latest !== null) {
				file['date'] = json[meta].latest.date
			}
			if(typeof json[meta].complete === 'undefined' || json[meta].complete === null) {
				json[meta].complete = 0
			}
			if(typeof json[meta] !== 'undefined' && json[meta] !== null) {
				file[config.meta.name] = json[meta]
			}
			res.push(file)
		})

		return res
  }

  static getAllFiles() {
  	var site = folderUtils.folderInfos(config.root)
	  var allDraft = []
	  var allPublished = []

    let draft = config.draft.url
    let publish = config.publish.url

    var drafted = FileParser.getFilesByType(fileUtils.concatPath(site.path, draft), 'd')
    var published = FileParser.getFilesByType(fileUtils.concatPath(site.path, publish))

		drafted = Hooks.instance.trigger('beforeGetAllFilesDraft', drafted)
		published = Hooks.instance.trigger('beforeGetAllFilesPublished', published)

    drafted = FileParser.getMetas(drafted, 'draft')
    published = FileParser.getMetas(published, 'draft')

    published.forEach(function (pub) {
    	
    	var json = FileParser.getJson(
  								FileParser.changePathEnv(pub.path, config.data.url)
  													.replace(new RegExp("\\." + config.files.templates.extension), '.json')
								  )
    	if(typeof json[config.meta.name][config.draft.url] !== 'undefined'
    		&& json[config.meta.name][config.draft.url] !== null) {
  			pub.filePath = json[config.meta.name][config.draft.url].latest.abeUrl
    	}
    })
    var merged = fileUtils.mergeFiles(drafted, published)

    site.files = Hooks.instance.trigger('afterGetAllFiles', merged)

	  return [site]
  }

  static removeFile(file, json) {
  	if(fileUtils.isFile(file)) {
  		fse.removeSync(file)
  	}

  	if(fileUtils.isFile(json)) {
  		fse.removeSync(json)
  	}
  }

  static unpublishFile(filePath) {
  	var tplUrl = FileParser.getFileDataFromUrl(fileUtils.concatPath(config.publish.url, filePath))

  	FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json)
  }

  static deleteFile(filePath) {
  	var tplUrl = FileParser.getFileDataFromUrl(fileUtils.concatPath(config.draft.url, filePath))
  	var files = FileParser.getFiles(tplUrl.draft.dir, true, 1, new RegExp("\\." + config.files.templates.extension))
  	var revisions = fileAttr.getFilesRevision(files, tplUrl.publish.file)

  	Array.prototype.forEach.call(revisions, (revision) => {
  		var revisionUrl = FileParser.getFileDataFromUrl(revision.path)
  		FileParser.removeFile(revision.path, revisionUrl.json.path)
  	})

  	FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json)
  }

  static deleteFileFromName(filePath) {
  	var path = filePath.split('/')
  	var file = path.pop()
  	path = path.join('/')
		try{
  		var stat = fse.statSync(path)
			if (stat) {
				var files = FileParser.getFiles(path, true, 10, new RegExp(`.${config.files.templates.extension}`))
				
				Array.prototype.forEach.call(files, (item) => {
					if(fileAttr.delete(item.name) === file) fse.removeSync(item.path)
				})
			}
		}
		catch(e){
			console.log(e)
		}
  }

  static getReference() {
  	var ref = {}

  	var refFolder = fileUtils.concatPath(config.root, config.reference.url)
  	if(folderUtils.isFolder(refFolder)) {
			var files = FileParser.read(fileUtils.cleanPath(refFolder), fileUtils.cleanPath(refFolder), 'files', true, /.json/)
			Array.prototype.forEach.call(files, (file) => {
				var name = file.filePath.replace(file.fileType, '')
				name = name.replace(/\//g, '.')
				var json = fse.readJsonSync(file.path)

				ref[name] = json
			})
  	}

  	return ref
  }

  static getJson(path, displayError = true) {
  	var json = {}
    // HOOKS beforeGetJson
    path = Hooks.instance.trigger('beforeGetJson', path)
    
		try {
			var stat = fse.statSync(path)
			if (stat) {
				var json = fse.readJsonSync(path)
				// var references = FileParser.getReference()
				// json[config.reference.name] = references
			}
		}catch(e) {
			if(displayError) console.log(clc.red(`Error loading json ${path}`),  `\n${e}`)
		}

    // HOOKS afterGetJson
    json = Hooks.instance.trigger('afterGetJson', json)
  	return json
  }
}