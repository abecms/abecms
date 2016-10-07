import path from 'path'
import {
  fileUtils,
  FileParser,
  coreUtils,
  cmsTemplate,
  cmsOperations,
  config,
  Hooks,
  cmsData,
  Manager
} from '../../'

var create = function(template, pathCreate, name, req, forceJson = {}, duplicate = false) {
  var p = new Promise((resolve, reject) => {
    Hooks.instance.trigger('beforeCreate', template, pathCreate, name, req, forceJson)

    var templatePath = fileUtils.getTemplatePath(template.replace(config.root, ''))
    var filePath = path.join(pathCreate, name)
    filePath = coreUtils.slug.clean(filePath)
    filePath = fileUtils.getFilePath(filePath)

    if(templatePath !== null && filePath !== null) {
      var tplUrl = FileParser.getFileDataFromUrl(filePath)
        
      if(!fileUtils.isFile(tplUrl.json.path)) {
        var json = (forceJson) ? forceJson : {}
        var tpl = templatePath
        var text = cmsTemplate.template.getTemplate(tpl)
        if (duplicate) {
          json = cmsData.values.removeDuplicate(text, json)
        }
        text = cmsData.source.removeDataList(text)
        var resHook = Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text)
        filePath = resHook.filePath
        json = resHook.json
        text = resHook.text

        Hooks.instance.trigger('afterCreate', json, text, pathCreate, name, req, forceJson)
        cmsOperations.save.save(filePath, template, json, text, 'draft', null, 'draft')
            .then((resSave) => {
              Manager.instance.updateList()
              filePath = resSave.htmlPath
              tplUrl = FileParser.getFileDataFromUrl(filePath)
              resolve(resSave.json)
            }).catch(function(e) {
              reject()
              console.error(e)
            })
      }else {
        json = FileParser.getJson(tplUrl.json.path)
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