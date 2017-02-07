import process from 'child_process'
import fse from 'fs-extra'

import {
  config
  ,abeExtend
  ,Manager
} from '../'

function prepend(value, array) {
  var newArray = array.slice(0)
  newArray.unshift(value)
  return newArray
}

var abeProcess = function(name, args = [], callback) {
  args = prepend(`ABE_WEBSITE=${config.root}`, args)
  args = prepend(`ABECMS_PATH=${__dirname}/../../../dist`, args)

  if (Manager.instance.isProcessRunning(name)) {
    return false
  }

  Manager.instance.addProcess(name)

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
      Manager.instance.removeProcess(name)
      console.log('process fork failed')
    }
  }

  if(typeof proc !== 'undefined' && proc !== null) {
    proc.on('message', function(data) {
      console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
      console.log('data', data)
      var data = JSON.parse(data)
      callback(data)
      if (data.msg == 'exit') {
        Manager.instance.removeProcess(name)
        proc.kill()
      }
    })
    return true
  }

  return false
}

export default abeProcess