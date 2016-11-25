import path from 'path'
import {
  coreUtils,
  cmsTemplates,
  cmsOperations,
  abeExtend,
  cmsData
} from '../../'

var create = function(template, pathCreate, name, req, forceJson = {}, duplicate = false) {
  var p = new Promise((resolve) => {
    abeExtend.hooks.instance.trigger('beforeCreate', template, pathCreate, name, req, forceJson)

    var postUrl = path.join('/', pathCreate, name)
    postUrl = coreUtils.slug.clean(postUrl)

    var json = (forceJson) ? forceJson : {}
    json = cmsData.metas.create(json, template, postUrl)

    if (duplicate) {
      if(json.abe_meta.publish != null) {
        delete json.abe_meta.publish
      }
      var templateText = cmsTemplates.template.getTemplate(template)
      json = cmsData.values.removeDuplicate(templateText, json)
    }
    var resHook = abeExtend.hooks.instance.trigger('beforeFirstSave', postUrl, req.body, json)
    postUrl = resHook.postUrl
    json = resHook.json

    var p2 = cmsOperations.post.draft(
      postUrl,
      json,
      'draft'
    )
    p2.then((result) => {
      abeExtend.hooks.instance.trigger('afterCreate', result)
      resolve(result.json)
    }).catch(function(e) {
      console.error('[ERROR] create.js', e)
    })
  }).catch(function(e) {
    console.error(e)
  })

  return p
}

export default create