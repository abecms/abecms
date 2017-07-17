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

export function remove(postUrl) {
  postUrl = abeExtend.hooks.instance.trigger('beforeDeleteFile', postUrl)

  var revisions = cmsData.revision.getVersions(postUrl)

  Array.prototype.forEach.call(revisions, revision => {
    const postPath = cmsData.utils.getPostPath(revision.path)
    cmsOperations.remove.removeFile(revision.path)
    cmsOperations.remove.removeFile(postPath)
  })

  postUrl = abeExtend.hooks.instance.trigger('afterDeleteFile', postUrl, {})

  Manager.instance.removePostFromList(
    postUrl.replace(new RegExp('\\/', 'g'), path.sep)
  )
}

export function removeFile(file) {
  if (coreUtils.file.exist(file)) {
    fse.removeSync(file)
  }
}
