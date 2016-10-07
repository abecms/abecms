import path from 'path'

import {
  cmsOperations
  ,coreUtils
  ,config
  ,Manager
  ,FileParser
} from '../../'


export function unpublish(filePath) {
  var tplUrl = FileParser.getFileDataFromUrl(path.join(config.publish.url, filePath))
  if(coreUtils.file.exist(tplUrl.json.path)) {
    var json = JSON.parse(JSON.stringify(FileParser.getJson(tplUrl.json.path)))
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
    .then((resSave) => {
      FileParser.removeFile(tplUrl.publish.path, tplUrl.publish.json)
      Manager.instance.updateList()
    })
  }
}