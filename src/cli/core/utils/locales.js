import fse from 'fs-extra'
import path from 'path'

import {config, coreUtils} from '../../'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Locales {
  constructor(enforcer) {
    if (enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'

    this.i18n = this._getLocales()
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new Locales(singletonEnforcer)
    }
    return this[singleton]
  }

  _reloadLocales() {
    this.i18n = this._getLocales()
  }

  _getLocales() {
    let loc = {}

    const extension = '.json'
    const localesFolder = path.join(config.root, 'locales')
    const files = coreUtils.file.getFilesSync(localesFolder, true, extension)
    Array.prototype.forEach.call(files, file => {
      const name = path.basename(file, extension)
      loc[name] = fse.readJsonSync(file)
    })

    return loc
  }
}

export default Locales
