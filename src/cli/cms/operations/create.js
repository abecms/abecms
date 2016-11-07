import path from 'path'
import {
  coreUtils,
  cmsTemplates,
  cmsOperations,
  config,
  abeExtend,
  cmsData,
  Manager
} from '../../'

var create = function(template, pathCreate, name, req, forceJson = {}, duplicate = false) {
  var p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforeCreate', template, pathCreate, name, req, forceJson)

    var templatePath = path.join(config.root, config.templates.url, `${template}.${config.files.templates.extension}`)
    var filePath = path.join(pathCreate, name)
    filePath = coreUtils.slug.clean(filePath)
    filePath = path.join(config.root, config.draft.url, filePath.replace(config.root,''))
    if(templatePath !== null && filePath !== null) {
      var tplUrl = cmsData.file.fromUrl(filePath)
        
      if(!coreUtils.file.exist(tplUrl.json.path)) {
        var json = (forceJson) ? forceJson : {}
        var tpl = templatePath
        var text = cmsTemplates.template.getTemplate(tpl)
        if (duplicate) {
          json = cmsData.values.removeDuplicate(text, json)
        }
        text = cmsData.source.removeDataList(text)
        var resHook = abeExtend.hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text)
        filePath = resHook.filePath
        json = resHook.json
        text = resHook.text

        abeExtend.hooks.instance.trigger('afterCreate', json, text, pathCreate, name, req, forceJson)
        cmsOperations.save.save(filePath, template, json, text, 'draft')
          .then((resSave) => {
            Manager.instance.updatePostInList(resSave.jsonPath)
            filePath = resSave.htmlPath
            tplUrl = cmsData.file.fromUrl(filePath)
            resolve(resSave.json)
          }).catch(function(e) {
            reject()
            console.error(e)
          })
      }else {
        json = cmsData.file.get(tplUrl.json.path)
        resolve(json, tplUrl.json.path)
      }
    }else {
      reject()
    }
  }).catch(function(e) {
    console.error(e)
  })

  return p
}

export default create