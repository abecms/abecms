import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import path from 'path'

import {
  cmsData,
  cmsTemplates,
  config
} from '../../'

export function copy(pathAssets) {
  var publicFolders = cmsTemplates.assets.getFolder(pathAssets)
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

export function getFolder(pathAssets = '') {
  var folder = path.join(config.root, pathAssets.replace(config.root, '')).replace(/\/$/, '')
  var assetsFolders = []
  var flatten = true

  let templates = config.templates.url
  let assets = config.files.templates.assets
  pathAssets = path.join(folder, templates)

  try {
    var directory = fse.lstatSync(pathAssets)
    if (directory.isDirectory()) {
      var arr = cmsData.file.read(pathAssets, pathAssets, 'files', flatten, /(.*?)/, 99)

      // now check if file for folder exist
      Array.prototype.forEach.call(arr, (file) => {
        var folderName = file.path.replace(path.extname(file.path), '') + assets
        try {
          var directory = fse.lstatSync(folderName)
          if (directory.isDirectory()) {
            assetsFolders.push(folderName)
          }
        } catch (e) {
        }
      })
    }
  } catch (e) {
  }

  return assetsFolders
}