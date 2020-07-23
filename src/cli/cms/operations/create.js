import path from 'path'
import {
  coreUtils,
  cmsTemplates,
  cmsOperations,
  abeExtend,
  cmsData
} from '../../'

var create = async function create(template, postUrl, forceJson = {}, user) {

  abeExtend.hooks.instance.trigger(
    'beforeCreate',
    forceJson,
    postUrl,
    template
  )
  postUrl = coreUtils.slug.clean(postUrl)
  var json = cmsData.metas.create(forceJson, template, postUrl, user)

  json = abeExtend.hooks.instance.trigger('beforeFirstSave', json, forceJson)
  var result = await cmsOperations.post.draft(json.abe_meta.link, json, 'draft', user)
  abeExtend.hooks.instance.trigger('afterCreate', result)

  return result.json
}

export default create