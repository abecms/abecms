import path from 'path'
import fs from 'fs'

import {config} from '../'

export function create(name) {
  let lockFile = path.join(config.root, `abe-process-${name}.lock`)
  try {
    var stats = fs.statSync(lockFile)
    if (stats.isFile()) {
      console.log(`cannot lock process ${name} already running`)
      return false
    }
  }catch(err) {
    fs.writeFileSync(lockFile, '', {encoding: 'utf8'})
  }

  return true
}

export function remove(name) {
  let lockFile = path.join(config.root, `abe-process-${name}.lock`)
  try {
    var stats = fs.statSync(lockFile)
    if (stats.isFile()) {
      fs.unlinkSync(lockFile)
      return true
    }
  }catch(err) {
    
  }
  return false
}

export function deleteAll() {
  var files = fs.readdirSync(config.root)
  Array.prototype.forEach.call(files, (file) => {
    if (file.indexOf('abe-process') > -1 && file.indexOf('.lock') > -1) {
      fs.unlinkSync(path.join(config.root, file))
    }
  })
}