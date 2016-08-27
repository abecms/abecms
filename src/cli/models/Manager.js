import {
  FileParser
} from '../../cli'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Manager {

  constructor(enforcer) {
    if(enforcer != singletonEnforcer) throw "Cannot construct Json singleton"
    
    this._list = FileParser.getAllFiles();
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Manager(singletonEnforcer)
    }
    return this[singleton]
  }

  getList() {

    return this._list
  }

  updateList() {

    this._list = FileParser.getAllFiles();

    return this
  }
}

export default Manager