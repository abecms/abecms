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
  Hooks
} from '../../cli'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)

  if(typeof req.query.oldFilePath !== 'undefined' && req.query.oldFilePath !== null) {
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

    var tplUrl = FileParser.getFileDataFromUrl(url)
    var json = FileParser.getJson(tplUrl.json.path)
    delete json.abe_meta
  }

  var p = abeCreate(req.query.selectTemplate, req.query.filePath, req.query.tplName, req, json)

  p.then((resSave) => {
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