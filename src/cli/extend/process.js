import process from 'child_process'
import fse from 'fs-extra'

import {
  config
  ,abeExtend
} from '../'

function prepend(value, array) {
  var newArray = array.slice(0)
  newArray.unshift(value)
  return newArray
}

var abeProcess = function(name, args = []) {
  args = prepend(`ABE_WEBSITE=${config.root}`, args)
  args = prepend(`ABEJS_PATH=${__dirname}/../../../dist`, args)

  if (!abeExtend.lock.create(name)) {
    return false
  }

  var proc
  var file = `${__dirname}/../../cli/process/${name}.js`
  try {
    var stats = fse.statSync(file)
    if (stats.isFile()) {
      proc = process.fork(file, args)
    }
  }catch(err) {
    try {
      file = abeExtend.plugins.instance.getProcess(name)
      stats = fse.statSync(file)
      if (stats.isFile()) {
        proc = process.fork(file, args)
      }
    }catch(err) {
      console.log('process fork failed')
    }
  }

  if(typeof proc !== 'undefined' && proc !== null) {
    proc.on('message', function(msg) {
      abeExtend.lock.remove(name)
      proc.kill()
    })
    return true
  }

  return false
}

export default abeProcess