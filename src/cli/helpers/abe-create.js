import {
  fileUtils,
  FileParser,
  Util,
  cleanSlug,
  getTemplate,
  save,
  config,
  log,
  Hooks
} from '../../cli'

var create = function(template, path, name, req, forceJson = {}) {
  var p = new Promise((resolve, reject) => {
      Hooks.instance.trigger('beforeCreate', template, path, name, req, forceJson)

      var templatePath = fileUtils.getTemplatePath(template.replace(config.root, ""))
      var filePath = fileUtils.concatPath(path, name)
      filePath = cleanSlug(filePath)
      filePath = fileUtils.getFilePath(filePath)

      if(templatePath !== null && filePath !== null) {
        var tplUrl = FileParser.getFileDataFromUrl(filePath)
        
        if(!fileUtils.isFile(tplUrl.json.path)) {
          var json = (forceJson) ? forceJson : {}
          var tpl = templatePath
          var text = getTemplate(tpl)
          text = Util.removeDataList(text)
          var resHook = Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text)
          filePath = resHook.filePath
          json = resHook.json
          text = resHook.text

          Hooks.instance.trigger('afterCreate', json, text, path, name, req, forceJson)
          save(filePath, req.query.selectTemplate, json, text, 'draft', null, 'draft')
            .then((resSave) => {
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