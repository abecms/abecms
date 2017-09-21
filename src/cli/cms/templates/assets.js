import fse from 'fs-extra'
import fsCompare from 'fs-compare'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import path from 'path'
import execPromise from 'child-process-promise'

import {coreUtils, cmsTemplates, config, Manager} from '../../'

export function copy() {
  let dest = path.join(config.root, config.publish.url)
  let directory = null
  try {
    directory = fse.lstatSync(dest)
    if (!directory.isDirectory() && !directory.isSymbolicLink()) {
      mkdirp.sync(dest)
    }
  } catch (e) {
    mkdirp.sync(dest)
  }

  directory = fse.lstatSync(dest)
  if (directory.isSymbolicLink()) dest = fse.readlinkSync(dest)
  var res = dircompare.compareSync(Manager.instance.pathTemplates, dest, {compareDate: true})

  res.diffSet.forEach(function(entry) {
    var state = {
      equal: '==',
      left: '->',
      right: '<-',
      distinct: '<>'
    }[entry.state]

    var name1 = entry.name1 ? entry.name1 : ''
    var name2 = entry.name2 ? entry.name2 : ''

    let exclude = new RegExp("\."+config.files.templates.extension+"$")
    if (
      !exclude.test(name1) &&
      !exclude.test(name2) &&
      entry.type1 !== 'directory' &&
      entry.type2 !== 'directory'
    ) {
      if (typeof entry.path1 !== 'undefined' && entry.path1 !== null) {
        var original = entry.path1
        var basePath = original.replace(Manager.instance.pathTemplates, '')
        var move = path.join(dest, basePath)

        if (move === dest) {
          fse.readdir(original, function(res, items) {
            Array.prototype.forEach.call(items, item => {
              var originalItem = path.join(original, item)
              var lstat = fse.lstatSync(originalItem)
              var destItem = path.join(dest, item)

              if (!lstat.isDirectory() && !exclude.test(originalItem)) {
                try {
                  fsCompare(modifiedTime, originalItem, destItem, function(
                    err,
                    diff
                  ) {
                    if (diff > 0) fse.copySync(originalItem, destItem)
                  })
                } catch (e) {
                  fse.copySync(originalItem, destItem)
                }
              }
            })
          })
        } else if (entry.type2 === 'missing' || entry.state === 'distinct') {
          fse.removeSync(move)
          fse.copySync(original, move)
        }
      }
    }
  })

  return true
}

function modifiedTime(fileName, cb) {
  fse.stat(fileName, function(err, stat) {
    if (err) {
      return cb(err)
    }
    return cb(null, stat.mtime)
  })
}
