import path from 'path'
import {
  fileUtils,
  FileParser,
  Util,
  cleanSlug,
  getTemplate,
  save,
  config,
  log,
  Hooks,
  removeDuplicateAttr,
  Manager
} from '../../cli'

var create = function(template, pathCreate, name, req, forceJson = {}, duplicate = false) {
  var p = new Promise((resolve, reject) => {
    Hooks.instance.trigger('beforeCreate', template, pathCreate, name, req, forceJson)

    var templatePath = fileUtils.getTemplatePath(template.replace(config.root, ''))
    var filePath = path.join(pathCreate, name)
    filePath = cleanSlug(filePath)
    filePath = fileUtils.getFilePath(filePath)

    if(templatePath !== null && filePath !== null) {
      var tplUrl = FileParser.getFileDataFromUrl(filePath)
        
      if(!fileUtils.isFile(tplUrl.json.path)) {
        var json = (forceJson) ? forceJson : {}
        var tpl = templatePath
        var text = getTemplate(tpl)
        if (duplicate) {
          json = removeDuplicateAttr(text, json)
        }
        text = Util.removeDataList(text)
        var resHook = Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text)
        filePath = resHook.filePath
        json = resHook.json
        text = resHook.text

        Hooks.instance.trigger('afterCreate', json, text, pathCreate, name, req, forceJson)
        save(filePath, req.query.selectTemplate, json, text, 'draft', null, 'draft')
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
        var json = FileParser.getJson(tplUrl.json.path)
        resolve(json, tplUrl.json.path)
      }
    }else {
      reject()
    }
  }).catch(function(e) {
    console.error(e)
    reject()
  })

  return p
}

export default create