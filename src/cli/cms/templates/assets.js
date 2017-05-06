import fse from 'fs-extra'
import fsCompare from 'fs-compare'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import path from 'path'
import execPromise from 'child-process-promise'

import {
  coreUtils,
  cmsTemplates,
  config
} from '../../'

export function copy() {
  var publicFolders = cmsTemplates.assets.getFolders()
  let publish = config.publish.url
  var dest = path.join(config.root, publish)
  try {
    var directory = fse.lstatSync(dest)
    if (!directory.isDirectory() && !directory.isSymbolicLink()) {
      mkdirp.sync(dest)
    }
  } catch (e) {
    mkdirp.sync(dest)
  }

  Array.prototype.forEach.call(publicFolders, (publicFolder) => {
    var directory = fse.lstatSync(dest)
    if(directory.isSymbolicLink()) dest = fse.readlinkSync(dest)
    var res = dircompare.compareSync(publicFolder, dest, {compareDate: true})

    res.diffSet.forEach(function (entry) {
      var state = {
        'equal' : '==',
        'left' : '->',
        'right' : '<-',
        'distinct' : '<>'
      }[entry.state]

      var name1 = entry.name1 ? entry.name1 : ''
      var name2 = entry.name2 ? entry.name2 : ''

      let exclude =  new RegExp(config.files.exclude)
      if(!exclude.test(name1) && !exclude.test(name2) && entry.type1 !== 'directory' && entry.type2 !== 'directory') {

        if(typeof entry.path1 !== 'undefined' && entry.path1 !== null) {
          var original = entry.path1
          var basePath = original.replace(publicFolder, '')
          var move = path.join(dest, basePath)

          if(move === dest){
            fse.readdir(original, function (res, items) {
              Array.prototype.forEach.call(items, (item) => {
                var lstat = fse.lstatSync(path.join(original, item))
                var originalItem = path.join(original, item)
                var destItem = path.join(dest, item)
                if (!lstat.isDirectory()) {
                  try {
                    fsCompare(modifiedTime, originalItem, destItem, function (err, diff) {
                      if(diff > 0) fse.copySync(originalItem, destItem)
                    })
                  } catch (e) {
                    fse.copySync(originalItem, destItem)
                  }
                }
              })
            })
          }
          else if(entry.type2 === 'missing' || entry.state === 'distinct') {
            fse.removeSync(move)
            fse.copySync(original, move)
          }
        }
      }
    })
  })

  return publicFolders
}

function modifiedTime(fileName, cb) {
  fse.stat(fileName, function (err, stat) {
    if (err) {
      return cb(err);
    }
    return cb(null, stat.mtime);
  });
}

export function getFolders() {
  const templateExtension = '.' + config.files.templates.extension
  const assetsExtension = config.files.templates.assets
  const pathAssets = path.join(config.root, config.themes.path, config.themes.name, config.themes.templates.path)
  let assetsFolders = []
  let files = coreUtils.file.getFilesSync(pathAssets, false, templateExtension)

  // now check if corresponding assets folder exist
  Array.prototype.forEach.call(files, (file) => {
    var folderName = file.replace(path.extname(file), assetsExtension)
    try {
      var directory = fse.lstatSync(folderName)
      if (directory.isDirectory()) {
        assetsFolders.push(folderName)
      }
    } catch (e) {
      //No directory with this name
    }
  })

  return assetsFolders
}