import {
  abeExtend,
  Manager,
  config,
  cmsData,
  cmsOperations
} from '../../'

var duplicate = function(oldFilePath, template, newPath, name, req, isUpdate = false) {
  var p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforeDuplicate', oldFilePath, template, newPath, name, req, isUpdate)

    var json = {}
    var revisions = []
    if(oldFilePath != null) {
      var files = Manager.instance.getList()
      var fileWithoutExtension = oldFilePath.replace('.' + config.files.templates.extension, '.json')

      var doc = null
      Array.prototype.forEach.call(files, (file) => {
        if (file.path.indexOf(fileWithoutExtension) > -1) {
          doc = file
        }
      })

      if(doc.revisions != null) {
        revisions = doc.revisions

        if(revisions != null && revisions[0] != null) {
          json = cmsData.file.get(revisions[0].path)
        }
      }
      
      delete json.abe_meta
    }

    abeExtend.hooks.instance.trigger('afterDuplicate', json, oldFilePath, template, newPath, name, req, isUpdate)

    var pCreate = cmsOperations.create(template, newPath, name, req, json, (isUpdate) ? false : true)
    pCreate.then((resSave) => {
      if (isUpdate) {
        abeExtend.hooks.instance.trigger('beforeUpdate', json, oldFilePath, template, newPath, name, req, isUpdate)
        cmsOperations.remove.remove(oldFilePath)
      }
      resolve(resSave)
    },
    () => {
      reject()
    }).catch(function(e) {
      console.error('[ERROR] abe-duplicate.js', e)
      reject()
    })
  })

  return p
}

export default duplicate