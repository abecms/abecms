import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import path from 'path'

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
    if (!directory.isDirectory()) {
      mkdirp.sync(dest)
    }
  } catch (e) {
    mkdirp.sync(dest)
  }

  Array.prototype.forEach.call(publicFolders, (publicFolder) => {
    var res = dircompare.compareSync(publicFolder, dest, {compareSize: true})

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

          if(entry.type2 === 'missing' || entry.state === 'distinct') {
            fse.removeSync(move)
            fse.copySync(original, move)
          }
        }
      }
    })
  })

  return publicFolders
}

export function getFolders() {
  const templateExtension = '.' + config.files.templates.extension
  const assetsExtension = config.files.templates.assets
  const pathAssets = path.join(config.root, config.templates.url)
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