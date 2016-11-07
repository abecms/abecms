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

    var postUrl = path.join(pathCreate, name)
    postUrl = coreUtils.slug.clean(postUrl)

    var filePath = path.join(config.root, config.draft.url, postUrl)

    var json = (forceJson) ? forceJson : {}
    json = cmsData.metas.create(json, template, postUrl)

    if (duplicate) {
      if(json.abe_meta.publish != null) {
        delete json.abe_meta.publish
      }
      json = cmsData.values.removeDuplicate(text, json)
    }
    var resHook = abeExtend.hooks.instance.trigger('beforeFirstSave', filePath, req.query, json)

    var p2 = cmsOperations.post.draft(
      postUrl, 
      json.abe_meta.template,
      json,
      "draft"
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