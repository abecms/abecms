import fs from 'fs-extra'
import mkdirp from 'mkdirp'
import path from 'path'

import {config, coreUtils, User} from '../../cli'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Manager {
  constructor(enforcer) {
    if (enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'

    this._file = path.join(config.root, 'users', 'bdd.json')
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new Manager(singletonEnforcer)
    }
    return this[singleton]
  }

  read() {
    if (this.isActive()) {
      if (coreUtils.file.exist(this._file)) {
        return JSON.parse(fs.readFileSync(this._file, 'utf8'))
      } else {
        this._users = []
        var admin = User.operations.add(config.users.default)
        this.save()
        User.operations.activate(admin.user.id)
        return JSON.parse(fs.readFileSync(this._file, 'utf8'))
      }
    }
    return []
  }

  save() {
    if (this.isActive()) {
      mkdirp.sync(path.dirname(this._file))
      fs.writeJsonSync(this._file, this._users, {space: 2, encoding: 'utf-8'})
    }
  }

  get() {
    if (this._users == null) {
      this._users = this.read()
    }
    return this._users
  }

  update(json) {
    if (this.isActive()) {
      this._users = json
      this.save()
      return true
    }

    return false
  }

  isActive() {
    return config.users.enable
  }
}

export default Manager
