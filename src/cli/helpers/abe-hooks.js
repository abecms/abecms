import fse from 'fs-extra'
import clc from 'cli-color'
import extend from 'extend'
import path from 'path'

import hooksDefault from '../../hooks/hooks'

import {
  Util
  ,FileParser
  ,config
  ,fileUtils
  ,cli
  ,Plugins
  ,log
} from '../'

import * as abe from '../'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Hooks {

  constructor(enforcer) {
    if(enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'

    if(fileUtils.isFile(path.join(config.root, config.hooks.url, 'hooks.js'))){
      var h = require(path.join(config.root, config.hooks.url, 'hooks.js'))
      this.fn = extend(true, hooksDefault, h.default)
    }
    else{
      this.fn = hooksDefault
    }
  }

  trigger() {
    if(arguments.length > 0) {
      var args = [].slice.call(arguments)
      var fn = args.shift()
      args.push(abe)
      
      if(typeof this.fn !== 'undefined' && this.fn !== null
        && typeof this.fn[fn] !== 'undefined' && this.fn[fn] !== null) {
        args[0] = this.fn[fn].apply(this, args)
      }

      args[0] = Plugins.instance.hooks.apply(Plugins.instance, [fn].concat(args))
    }

    return args[0]
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Hooks(singletonEnforcer)
    }
    return this[singleton]
  }
}

export default Hooks