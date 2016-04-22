import fse from 'fs-extra'
import mkdirp from 'mkdirp'

import {
  config,
  cli,
  log,
  folderUtils,
  fileUtils,
  FileParser,
  fileAttr,
  getAttr
} from './'

export default class Create {

	constructor() {}

	init(path) {
		this.addFolder(path)
		process.chdir(path)
	 	this.addFolder(config.publish.url)
		this.addFolder(config.templates.url)
		this.addFolder(config.structure.url)
		this.addFolder(config.reference.url)
		this.addFolder(config.data.url)
		this.addFolder(config.draft.url)
	}

	addFolder(folder){
		mkdirp(folder)
	}
}