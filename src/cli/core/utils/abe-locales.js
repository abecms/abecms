import fse from 'fs-extra'
import clc from 'cli-color'
import path from 'path'

import {
  config,
  fileUtils,
  FileParser
} from '../../'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Locales {

  constructor(enforcer) {
    if(enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'

    this.i18n = this._getFiles()
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Locales(singletonEnforcer)
    }
    return this[singleton]
  }

  _reloadLocales() {
    this.i18n = this._getFiles()
  }
  
  _getFiles() {
    var loc = {}
    var website = config.root

    try{
      var localesFolder = path.join(website, 'locales')
      var stat = fse.statSync(localesFolder)
      if (stat && stat.isDirectory()) {
        var files = FileParser.read(fileUtils.cleanPath(localesFolder), fileUtils.cleanPath(localesFolder), 'files', true, /\.json/, 0)
        Array.prototype.forEach.call(files, (file) => {
          var json = fse.readJsonSync(file.path)
          loc[file.name.replace(/\.json/, '')] = json
        })
      }
    }catch(e){}

    return loc
  }
}

export default Locales