import {
  Hooks,
  fileUtils,
  FileParser,
  fileAttr,
  Util,
  cleanSlug,
  getTemplate,
  config,
  save,
  abeCreate,
  log
} from '../../cli'

var duplicate = function(oldFilePath, template, path, name, req, isUpdate = false) {
  var p = new Promise((resolve, reject) => {
    Hooks.instance.trigger('beforeDuplicate', oldFilePath, template, path, name, req, isUpdate)

    if(typeof oldFilePath !== 'undefined' && oldFilePath !== null) {
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
      }else if (isUpdate) {
        files = FileParser.getFiles(folderFilePath, true, 2)
        revisions = fileAttr.getFilesRevision(files, url)
      }


      var tplUrl = FileParser.getFileDataFromUrl(url)
      if (!fileUtils.isFile(tplUrl.json.path)) {
      }else {
      }
      var json = FileParser.getJson(tplUrl.json.path)
      delete json.abe_meta
    }

    if (isUpdate) {
      Hooks.instance.trigger('beforeUpdate', json, oldFilePath, template, path, name, req, isUpdate)
      Array.prototype.forEach.call(revisions, (revision) => {
        if(typeof revision.path !== 'undefined' && revision.path !== null) {
          FileParser.deleteFile(revision.path)
        }
      })
    }
    Hooks.instance.trigger('afterDuplicate', json, oldFilePath, template, path, name, req, isUpdate)

    var pCreate = abeCreate(template, path, name, req, json, (isUpdate) ? false : true)
    pCreate.then((resSave) => {
      resolve(resSave)
    },
    () => {
      reject()
    }).catch(function(e) {
      console.error(e)
      reject()
    })
  })

  return p
}

export default duplicate