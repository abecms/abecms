import fse from 'fs-extra'
import path from 'path'

import {
  config,
  abeExtend,
  cmsData,
  coreUtils,
  cmsOperations,
  Manager
} from '../../'


export function remove(filePath) {
  filePath = coreUtils.slug.clean(filePath)
  filePath = abeExtend.hooks.instance.trigger('beforeDeleteFile', filePath)

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

export function olderRevisionByType(filePath, type) {

  const folder = path.dirname(filePath)
  const file = path.basename(filePath)
  const extension = path.extname(filePath)

  const files = coreUtils.file.getFiles(folder, false, extension)
  Array.prototype.forEach.call(files, (fileItem) => {
    const fname = cmsData.fileAttr.delete(fileItem)
    const ftype = cmsData.fileAttr.get(fileItem).s
    if(fname === file && ftype === type){
      const fileDraft = fileItem.replace(/-abe-./, '-abe-d')
      cmsOperations.remove.removeFile(fileItem, coreUtils.file.changePath(fileItem, config.data.url).replace(extension, '.json'))
      cmsOperations.remove.removeFile(fileDraft, coreUtils.file.changePath(fileDraft, config.data.url).replace(extension, '.json'))
    }
  })
}
