import fse from 'fs-extra'
import clc from 'cli-color'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'
import path from 'path'

import {
	save
	,folderUtils
	,fileUtils
	,fileAttr
	,config
	,Hooks
	,Plugins
  ,Manager
  ,TimeMesure
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
    return file.replace(/^\//, '')
  }

  static getType(path) {
    var folders = path.replace(config.root, '')
    folders = folders.replace(/^\//, '')
    return folders.split('/')[0]
  }

  static read(base, dirName, type, flatten, extensions = /(.*?)/, max = 99, current = 0, inversePattern = false) {
    var arr = []
    var level = fse.readdirSync(dirName)
    var fileCurrentLevel = []
    let assets = config.files.templates.assets
  	  
    for (var i = 0; i < level.length; i++) {
      var path = dirName + '/' + level[i]
      var isFolder = folderUtils.isFolder(path)
      var match = (isFolder) ? true : (inversePattern) ? !extensions.test(level[i]) : extensions.test(level[i])
      if((type === 'files' || type === null) && match) {

        if(fileUtils.isValidFile(level[i])) {
          var extension = /(\.[\s\S]*)/.exec(level[i])[0]
          var cleanName = fileAttr.delete(level[i])
          var cleanNameNoExt = fileUtils.removeExtension(cleanName)
          var fileData = fileAttr.get(level[i])

          var date
          if (fileData.d) {
            date = fileData.d
          }else {
            var stat = fse.statSync(path)
            date = stat.mtime
          }
          var status = fileData.s ? dirName.replace(config.root, '').replace(/^\//, '').split('/')[0] : 'published'
          var cleanFilePath = fileUtils.cleanFilePath(path)

          var fileDate = moment(date)
          var duration = moment.duration(moment(fileDate).diff(new Date())).humanize(true)

          var filePath = path.replace(config.root, '')
          filePath = filePath.split('/')
          filePath.shift()
          filePath = filePath.join('/')
          var item = {
            'name': level[i],
            'path': path,
            'cleanPathName': fileAttr.delete(path),
            'cleanPath': path.replace(base + '/', ''),
            date: date,
            cleanDate: fileDate.format('YYYY/MM/DD HH:MM:ss'),
            duration: duration,
  						// status: status,
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
          fileCurrentLevel.push(fileUtils.removeExtension(level[i]) + assets)
        }
      }
      if(!fileCurrentLevel.includes(level[i]) && match) {
        if(isFolder) {
          if(!flatten) {
            var index = arr.push({'name': level[i], 'path': path, 'cleanPath': path.replace(base + '/', ''), 'folders': [], 'type': 'folder'}) - 1
            if(current < max){
              arr[index].folders = FileParser.read(base, path, type, flatten, extensions, max, current + 1, inversePattern)
            }
          }else {
            if(type === 'folders' || type === null) {
              arr.push({'name': level[i], 'path': path, 'cleanPath': path.replace(base + '/', ''), 'type': 'folder'})
            }
            if(current < max){
              Array.prototype.forEach.call(FileParser.read(base, path, type, flatten, extensions, max, current + 1, inversePattern), (files) => {
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
  
  static getFiles(folder, flatten, level, extensions = /(.*?)/, inversePattern = false) {
    var arr = []
    flatten = flatten || false
    arr = FileParser.read(fileUtils.cleanPath(folder), fileUtils.cleanPath(folder), 'files', flatten, extensions, level, 0, inversePattern)

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
  
  static getAssetsFolder(pathAssets = '') {
    var folder = fileUtils.pathWithRoot(pathAssets)
    var assetsFolders = []
    var flatten = true
    var site = folder

    let templates = config.templates.url
    let assets = config.files.templates.assets
    var pathAssets = path.join(folder, templates)

    if(folderUtils.isFolder(pathAssets)) {
      var arr = FileParser.read(pathAssets, pathAssets, 'files', flatten, /(.*?)/, 99)

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

  static getProjectFiles() {
    var site = folderUtils.folderInfos(config.root)
    var result = {'structure': [], 'templates': []}

    let structure = config.structure.url
    let templates = config.templates.url

    if(folderUtils.isFolder(path.join(site.path, structure))) {
      site.folders = FileParser.getFolders(path.join(site.path, structure), false)
      result.structure = site.folders
    }
    if(folderUtils.isFolder(path.join(site.path, templates))) {
      result.templates = result.templates.concat(FileParser.getFiles(path.join(site.path, templates), true, 10, new RegExp(`.${config.files.templates.extension}`)))
    }

    return result
  }

  static changePathEnv(pathEnv, change) {
    pathEnv = pathEnv.replace(config.root, '').replace(/^\//, '').split('/')
    pathEnv[0] = change
  	
    return path.join(config.root, pathEnv.join('/'))
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
    if(typeof url !== 'undefined' && url !== null) {

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

      var draftPath = FileParser.changePathEnv(path.join(config.root, dir), draft)

      res.root = config.root

	  	// set dir path draft/json
      res.draft.dir = FileParser.changePathEnv(path.join(config.root, dir), draft)
      res.json.dir = FileParser.changePathEnv(path.join(config.root, dir), data)
      res.publish.dir = FileParser.changePathEnv(path.join(config.root, dir), publish)
      res.publish.json = res.json.dir

	  	// set filename draft/json
      res.draft.file = filename
      res.publish.file = fileAttr.delete(filename)
      res.publish.link = link
      res.json.file = fileUtils.replaceExtension(filename, 'json')
      res.publish.json = path.join(res.json.dir, fileAttr.delete(res.json.file))

	  	// set filename draft/json
      res.draft.path = path.join(res.draft.dir, res.draft.file)
      res.publish.path = path.join(res.publish.dir, res.publish.file)
      res.json.path = path.join(res.json.dir, res.json.file)

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

  static copySiteAssets(pathAssets) {
    var publicFolders = FileParser.getAssetsFolder(pathAssets)
    let publish = config.publish.url
    var dest = path.join(config.root, publish)
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

        let exclude =  new RegExp(config.files.exclude)
        if(!exclude.test(name1) && !exclude.test(name2) && entry.type1 !== 'directory' && entry.type2 !== 'directory') {
			    
          if(typeof entry.path1 !== 'undefined' && entry.path1 !== null) {
            var original = entry.path1
            var basePath = original.replace(publicFolder, '')
            var move = path.join(dest, basePath)

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

  static getAllFilesWithKeys(withKeys) {
    var site = folderUtils.folderInfos(config.root)

    var files = FileParser.getFiles(path.join(config.root, config.data.url), true, 99, /\.json/)
    var filesArr = []

    var i = 0

    files.forEach(function (file) {
      // var t = new TimeMesure('add files')
      var cleanFile = file
      var json = FileParser.getJson(file.path)

      if(typeof json.abe_meta.latest !== 'undefined' && json.abe_meta.latest !== null
        && typeof json.abe_meta.latest !== 'undefined' && json.abe_meta.latest !== null
        && typeof json.abe_meta.latest.date !== 'undefined' && json.abe_meta.latest.date !== null) {
        file.date = json.abe_meta.latest.date
      }

      if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
        var date = null
        if (typeof json.abe_meta.latest !== 'undefined' && json.abe_meta.latest !== null
          && typeof json.abe_meta.latest.date !== 'undefined' && json.abe_meta.latest.date !== null) {
          date = json.abe_meta.latest.date
        }else if (typeof json.abe_meta.date !== 'undefined' && json.abe_meta.date !== null) {
          date = json.abe_meta.date
        }
        cleanFile.abe_meta = {
          date: date
          , type: (typeof json.abe_meta.type !== 'undefined' && json.abe_meta.type !== null) ? json.abe_meta.type : null
          , link: (typeof json.abe_meta.link !== 'undefined' && json.abe_meta.link !== null) ? json.abe_meta.link : null
          , template: (typeof json.abe_meta.template !== 'undefined' && json.abe_meta.template !== null) ? json.abe_meta.template : null
          , status: (typeof json.abe_meta.status !== 'undefined' && json.abe_meta.status !== null) ? json.abe_meta.status : null
          , cleanName: (typeof json.abe_meta.cleanName !== 'undefined' && json.abe_meta.cleanName !== null) ? json.abe_meta.cleanName : null
          , cleanFilename: (typeof json.abe_meta.cleanFilename !== 'undefined' && json.abe_meta.cleanFilename !== null) ? json.abe_meta.cleanFilename : null
        }
      }
      Array.prototype.forEach.call(withKeys, (key) => {
        var keyFirst = key.split('.')[0]
        cleanFile[keyFirst] = json[keyFirst]
      })
      filesArr.push(cleanFile)
      // t.duration()
    })

    var merged = fileUtils.getFilesMerged(filesArr)

    Hooks.instance.trigger('afterGetAllFiles', merged)
    return merged
  }

  // TODO : change the signature of this method to removeFile(file)
  static removeFile(file, json) {
    if(fileUtils.isFile(file)) {
      fse.removeSync(file)
    }

    if(fileUtils.isFile(json)) {
      fse.removeSync(json)
    }
  }

  static unpublishFile(filePath) {
    var tplUrl = FileParser.getFileDataFromUrl(path.join(config.publish.url, filePath))
    if(fileUtils.isFile(tplUrl.json.path)) {
      var json = JSON.parse(JSON.stringify(FileParser.getJson(tplUrl.json.path)))
      if(typeof json.abe_meta.publish !== 'undefined' && json.abe_meta.publish !== null) {
        delete json.abe_meta.publish
      }

      save(
	      fileUtils.getFilePath(json.abe_meta.link),
	      json.abe_meta.template,
	      json,
	      '',
	      'reject',
	      null,
	      'reject'
      )
	    .then((resSave) => {
      FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json)
      Manager.instance.updateList()
    })
    }
  }

  static deleteFile(filePath) {
    filePath = Hooks.instance.trigger('beforeDeleteFile', filePath)

    var revisions = fileAttr.getVersions(filePath)

    Array.prototype.forEach.call(revisions, (revision) => {
      FileParser.removeFile(revision.path, revision.htmlPath)
    })

    Manager.instance.updateList()
  }

  static deleteFileFromName(filePath) {
    var pathDelete = filePath.split('/')
    var file = pathDelete.pop()
    pathDelete = pathDelete.join('/')
    try{
      var stat = fse.statSync(pathDelete)
      if (stat) {
        var files = FileParser.getFiles(pathDelete, true, 10, new RegExp(`.${config.files.templates.extension}`))
				
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

    var refFolder = path.join(config.root, config.reference.url)
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

  static getJson(pathJson, displayError = true) {
    var json = {}
    // HOOKS beforeGetJson
    pathJson = Hooks.instance.trigger('beforeGetJson', pathJson)
    
    try {
      var stat = fse.statSync(pathJson)
      if (stat) {
        var json = fse.readJsonSync(pathJson)
				// var references = FileParser.getReference()
				// json[config.reference.name] = references
      }
    }catch(e) {
			// if(displayError) console.log(clc.red(`Error loading json ${path}`),  `\n${e}`)
    }

    // HOOKS afterGetJson
    json = Hooks.instance.trigger('afterGetJson', json)
    return json
  }
}