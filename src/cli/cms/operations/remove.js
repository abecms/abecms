import path from 'path'
import fse from 'fs-extra'

import {
  Hooks,
  cmsData,
  coreUtils,
  cmsOperations,
  Manager
} from '../../'


export function remove(filePath) {
  filePath = coreUtils.slug.clean(filePath)
  filePath = Hooks.instance.trigger('beforeDeleteFile', filePath)

  var revisions = cmsData.revision.getVersions(filePath)

  Array.prototype.forEach.call(revisions, (revision) => {
    cmsOperations.remove.removeFile(revision.path, revision.htmlPath)
  })

  Manager.instance.updateList()
}

export function removeFile(file, json) {
  if(coreUtils.file.exist(file)) {
    fse.removeSync(file)
  }

  if(coreUtils.file.exist(json)) {
    fse.removeSync(json)
  }
}

export function olderRevisionByType(fileName, type) {
  var folder = fileName.split('/')
  var file = folder.pop()
  var extension = file.replace(/.*?\./, '')
  folder = folder.join('/')
  var stat = fse.statSync(folder)
  if(stat){
    var files = FileParser.getFiles(folder, true, 1, new RegExp('\\.' + extension))
    files.forEach(function (fileItem) {
      var fname = cmsData.fileAttr.delete(fileItem.cleanPath)
      var ftype = cmsData.fileAttr.get(fileItem.cleanPath).s
      if(fname === file && ftype === type){
        var fileDraft = fileItem.path.replace(/-abe-./, '-abe-d')
        cmsOperations.remove.removeFile(fileItem.path, FileParser.changePathEnv(fileItem.path, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
        cmsOperations.remove.removeFile(fileDraft, FileParser.changePathEnv(fileDraft, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
      }
    })
  }
}