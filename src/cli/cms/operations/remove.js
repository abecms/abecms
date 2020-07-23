import fse from 'fs-extra'
import path from 'path'

import {
  config,
  mongo,
  abeExtend,
  cmsData,
  coreUtils,
  cmsOperations,
  Manager
} from '../../'

export async function remove(postUrl) {
  postUrl = abeExtend.hooks.instance.trigger('beforeDeleteFile', postUrl)

  const docRelativePath = cmsData.utils.getDocRelativePathFromPostUrl(postUrl)
  const revisions = cmsData.revision.getVersions(docRelativePath)

  await Promise.all(revisions.map(async revision => {
    const postPath = cmsData.utils.getPostPath(revision.path)
    await cmsOperations.remove.removeRevision(revision.path)
    await cmsOperations.remove.removePost(postPath)
  }));

  postUrl = abeExtend.hooks.instance.trigger('afterDeleteFile', postUrl, {})

  Manager.instance.removePostFromList(
    postUrl.replace(new RegExp('\\/', 'g'), path.sep)
  )
}

export async function removePost(file) {
  if (coreUtils.file.exist(file)) {
    await fse.remove(file)
  }
}

export async function removeRevision(jsonPath) {

  let result = false;
  if (config.database.type == "file") {
    result = await removeRevisionFile(jsonPath);
  }
  else if (config.database.type == "mongo") {
    result = await mongo.removeRevision(jsonPath);
  }

  return result
}

export async function removeRevisionFile(file) {
  if (coreUtils.file.exist(file)) {
    await fse.remove(file)
  }
}
