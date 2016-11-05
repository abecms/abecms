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

const create = function(templateId, pathCreate, name, req, forceJson = {}, duplicate = false) {
  const p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforeCreate', templateId, pathCreate, name, req, forceJson)

    const templatePath = path.join(config.root, config.templates.url, `${templateId}.${config.files.templates.extension}`)
    let postDataPath = path.join(pathCreate, name)
    postDataPath = coreUtils.slug.clean(postDataPath)
    postDataPath = path.join(config.root, config.data.url, postDataPath)

    if(templatePath !== null && postDataPath !== null) {
      if(!coreUtils.file.exist(postDataPath)) {
        let postData = (forceJson) ? forceJson : {}
        let template = cmsTemplates.template.getTemplate(templatePath)
        if (duplicate) {
          postData = cmsData.values.removeDuplicate(template, postData)
        }
        template = cmsData.source.removeDataList(template)
        var resHook = abeExtend.hooks.instance.trigger('beforeFirstSave', postDataPath, req.query, postData, template)
        postDataPath = resHook.filePath
        postData = resHook.json
        template = resHook.text

        abeExtend.hooks.instance.trigger('afterCreate', postData, template, pathCreate, name, req, forceJson)
        cmsOperations.save.save(postDataPath, templateId, postData, template, 'draft', null, 'draft')
          .then((resSave) => {
            Manager.instance.updatePostInList(resSave.jsonPath)
            resolve(resSave.json)
          }).catch(function(e) {
            reject()
            console.error(e)
          })
      }else {
        postData = cmsData.file.get(postDataPath)
        resolve(postData, postDataPath)
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