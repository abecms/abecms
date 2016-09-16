import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'

import {
	cli,
	log,
	fileUtils,
	fileAttr,
	config
} from '../'

export default class FolderUtils {

	constructor() {}

	static isFolder(path) {
		try{
			var stat = fse.statSync(path)

			if (stat && stat.isDirectory()) {
	      return true
	    }
		}catch(e){
			return false
		}
		return false
	}

	static createFile(path, content = {}) {
		if(path.indexOf('.json') > -1) {
	    fse.writeJsonSync(path, content, { space: 2, encoding: 'utf-8' })
	  }
	}

	static createFolder(path) {
		if(!FolderUtils.isFolder(path)) {
	    mkdirp.sync(path)
	  }
	}

	static getFolderPath(path) {
		var folders = path.replace(config.root, '')
		folders = folders.replace(/^\//, "")
		folders = folders.split('/')
		folders.shift()
		folders = folders.join('/')
		folders = fileUtils.removeLast(folders)
		return folders
	}

	static folderInfos(pathFolder) {
		var pathArr = pathFolder.split('/')
		var name = pathArr[pathArr.length - 1]

		var rootArr = config.root.split('/')
		var website = rootArr[pathArr.length - 1]
		return {
			'name': name,
			'path': pathFolder,
			'website': website,
			'cleanPath': fileUtils.cleanPath(pathFolder.replace(config.root, '')),
			'type': 'folder'
		}
	}
  
}
