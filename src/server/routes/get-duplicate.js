import {
  serveSite,
  fileUtils,
  FileParser,
  fileAttr,
  Util,
  cleanSlug,
  getTemplate,
  config,
  save,
  abeCreate,
  log,
  Hooks
} from '../../cli'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)

  if(typeof req.query.oldFilePath !== 'undefined' && req.query.oldFilePath !== null) {
    log.write('duplicate', '********************************************')
    log.write('duplicate', 'oldFilePath: ' + req.query.oldFilePath)
    var url = fileUtils.concatPath(config.root, config.draft.url, req.query.oldFilePath)

    if(!fileAttr.test(url)){
      var folderFilePath = url.split('/')
      folderFilePath.pop()
      folderFilePath = fileUtils.pathWithRoot(folderFilePath.join('/'))
      var files = FileParser.getFiles(folderFilePath, true, 2)
      var latest = fileAttr.filterLatestVersion(fileAttr.getFilesRevision(files, url), 'draft')
      if(latest.length) {
        url = latest[0].path
      }
    }
    log.write('duplicate', 'url with date: ' + url.replace(config.root, ''))

    var tplUrl = FileParser.getFileDataFromUrl(url)
    if (!fileUtils.isFile(tplUrl.json.path)) {
      log.write('duplicate', '[ ERROR ] no json found : ' + tplUrl.json.path.replace(config.root, ''))
    }else {
      log.write('duplicate', 'json found: ' + tplUrl.json.path.replace(config.root, ''))
    }
    var json = FileParser.getJson(tplUrl.json.path)
    delete json.abe_meta
  }

  log.write('duplicate', 'selectTemplate: ' + req.query.selectTemplate)
  log.write('duplicate', 'filePath: ' + req.query.filePath)
  log.write('duplicate', 'tplName: ' + req.query.tplName)
  var p = abeCreate(req.query.selectTemplate, req.query.filePath, req.query.tplName, req, json)

  p.then((resSave, jsonPath, htmlPath) => {
    log.write('duplicate', 'success')
    log.write('duplicate', 'json saved at: ' + jsonPath)
    log.write('duplicate', 'html saved at: ' + htmlPath)
    var result = {
      success: 1,
      json: resSave
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  () => {
    var result = {
      success: 0
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  })
}

export default route