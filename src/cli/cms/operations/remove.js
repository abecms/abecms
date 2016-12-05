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
  filePath = abeExtend.hooks.instance.trigger('beforeDeleteFile', filePath)

  var revisions = cmsData.revision.getVersions(filePath)

  Array.prototype.forEach.call(revisions, (revision) => {
    cmsOperations.remove.removeFile(revision.path, revision.htmlPath)
  })

  filePath = abeExtend.hooks.instance.trigger('afterDeleteFile', filePath, {})

  Manager.instance.removePostFromList(filePath.replace(new RegExp('\\/', 'g'), path.sep))
}

export function removeFile(file, json) {
  if(coreUtils.file.exist(file)) {
    fse.removeSync(file)
  }

  if(coreUtils.file.exist(json)) {
    fse.removeSync(json)
  }
}
