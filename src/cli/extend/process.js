import process from 'child_process'
import fse from 'fs-extra'
import path from 'path'
import fs from 'fs'

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

  let lockFile = path.join(config.root, `abe-process-${name}.lock`)
  try {
    var stats = fse.statSync(lockFile)
    if (stats.isFile()) {
      console.log(`cannot start process ${name} already running`)
      return false
    }
  }catch(err) {
    fs.writeFileSync(lockFile, '', {encoding: 'utf8'})
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
    proc.on('message', function( msg ) {
      fs.unlinkSync(lockFile)
      proc.kill()
    });
    return true
  }

  return false
}

export default abeProcess