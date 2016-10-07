import path from 'path'

import {
  cmsData,
  cmsOperations,
  coreUtils,
  config,
  Manager
} from '../../'


export function unpublish(filePath) {
  var tplUrl = cmsData.file.fromUrl(path.join(config.publish.url, filePath))
  if(coreUtils.file.exist(tplUrl.json.path)) {
    var json = JSON.parse(JSON.stringify(cmsData.file.get(tplUrl.json.path)))
    if(typeof json.abe_meta.publish !== 'undefined' && json.abe_meta.publish !== null) {
      delete json.abe_meta.publish
    }

    cmsOperations.save.save(
      path.join(config.root, config.draft.url, json.abe_meta.link.replace(config.root)),
      json.abe_meta.template,
      json,
      '',
      'reject',
      null,
      'reject'
    )
    .then(() => {
      cmsOperations.remove.removeFile(tplUrl.publish.path, tplUrl.publish.json)
      Manager.instance.updateList()
    })
  }
}