import path from 'path'
import {
  coreUtils,
  cmsTemplates,
  cmsOperations,
  abeExtend,
  cmsData
} from '../../'

var create = function(template, postUrl, forceJson = {}) {
  var p = new Promise((resolve) => {

    abeExtend.hooks.instance.trigger('beforeCreate', forceJson, postUrl, template)
    postUrl = coreUtils.slug.clean(postUrl)
    var json = cmsData.metas.create(forceJson, template, postUrl)

    json = abeExtend.hooks.instance.trigger('beforeFirstSave', json, forceJson)
    var p2 = cmsOperations.post.draft(
      json.abe_meta.link,
      json,
      'draft'
    )
    p2.then((result) => {
      abeExtend.hooks.instance.trigger('afterCreate', result)
      resolve(result.json)
    }).catch(function(e) {
      console.error('[ERROR] create.js', e.stack)
    })
  }).catch(function(e) {
    console.error(e.stack)
  })

  return p
}

export default create