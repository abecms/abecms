import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import {Promise} from 'es6-promise'
import slug from 'limax' 

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
    path = path.split('/')
    path[path.length - 1] = slug(path[path.length - 1]) 
    path = path.join('/')
    this.addFolder(path)
			.then(() => {
  process.chdir(path)
  this.addFolder(config.publish.url)
  this.addFolder(config.templates.url)
  this.addFolder(config.structure.url)
  this.addFolder(config.reference.url)
  this.addFolder(config.data.url)
  this.addFolder(config.draft.url)
}).catch(function(e) {
  console.error(e)
})
  }

  addFolder(folder){
    var p = new Promise((resolve, reject) => {
      mkdirp(folder)
      resolve()
    })

    return p
  }
}