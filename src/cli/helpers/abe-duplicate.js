import {
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

var duplicate = function(oldFilePath, template, path, name, req, deleteFiles = false) {
  var p = new Promise((resolve, reject) => {

    if(typeof oldFilePath !== 'undefined' && oldFilePath !== null) {
      log.write('duplicate', 'oldFilePath: ' + oldFilePath)
      var url = fileUtils.concatPath(config.root, config.draft.url, oldFilePath)
      var revisions = []

      if(!fileAttr.test(url)){
        var folderFilePath = url.split('/')
        folderFilePath.pop()
        folderFilePath = fileUtils.pathWithRoot(folderFilePath.join('/'))

        var files = FileParser.getFiles(folderFilePath, true, 2)
        revisions = fileAttr.getFilesRevision(files, url)
        var latest = fileAttr.filterLatestVersion(revisions, 'draft')
        if(latest.length) {
          url = latest[0].path
        }
      }else if (deleteFiles) {
        files = FileParser.getFiles(folderFilePath, true, 2)
        revisions = fileAttr.getFilesRevision(files, url)
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

    if (deleteFiles) {
      Array.prototype.forEach.call(revisions, (revision) => {
        if(typeof revision.path !== 'undefined' && revision.path !== null) {
          log.write('delete', 'file ' + revision.path.replace(config.root, ''))
          FileParser.deleteFile(revision.path)
        }
      })
    }

    var pCreate = abeCreate(template, path, name, req, json)
    pCreate.then((resSave) => {
      log.write('duplicate', 'success')
      resolve(resSave)
    },
    () => {
      reject()
    }).catch(function(e) {
      log.write('duplicate', '[ ERROR ]' + e.stack)
      console.error(e.stack)
      reject()
    })
  })

  return p
}

export default duplicate