import fse from 'fs-extra'
import dircompare from 'dir-compare'
import mkdirp from 'mkdirp'
import moment from 'moment'
import path from 'path'

import {
  cmsData
  ,cmsOperations
  ,coreUtils
  ,FileParser
  ,config
  ,Hooks
  ,Manager
} from '../../'

export function copy(pathAssets) {
  var publicFolders = FileParser.getAssetsFolder(pathAssets)
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