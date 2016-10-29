import mkdirp from 'mkdirp'
import {Promise} from 'bluebird'
import slug from 'limax' 

import {
  config
} from '../'

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
    var p = new Promise((resolve) => {
      mkdirp(folder)
      resolve()
    })

    return p
  }
}