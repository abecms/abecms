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

  Array.prototype.forEach.call(revisions, (revision) => {
    const htmlPath = path.join(config.root, config.publish.url, revision.path.replace(/\.json/, `.${config.files.templates.extension}`))
    cmsOperations.remove.removeFile(revision.path)
    cmsOperations.remove.removeFile(htmlPath)
  })

  postUrl = abeExtend.hooks.instance.trigger('afterDeleteFile', postUrl, {})

  Manager.instance.removePostFromList(postUrl.replace(new RegExp('\\/', 'g'), path.sep))
}

export function removeFile(file) {
  if(coreUtils.file.exist(file)) {
    fse.removeSync(file)
  }
}
