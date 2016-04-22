
let singleton = Symbol()
let singletonEnforcer = Symbol()

class abeEngine {

  constructor(enforcer) {
    if(enforcer != singletonEnforcer) throw "Cannot construct Json singleton"
    this._content = {}
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new abeEngine(singletonEnforcer)
    }
    return this[singleton]
  }

  get content(){
    return this._content
  }

  set content(content){
    this._content = content
  }
}

export default abeEngine
