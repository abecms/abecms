import path from 'path'

import {cmsData, Page, cmsTemplates, abeExtend} from '../../'

/**
 * This function takes a json and optionally a template (in HTML) and returns its abified version (HTML)
 * @param  {[type]} json     [description]
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
export function abify(json, template = null) {
  var p = new Promise(resolve => {
    abeExtend.hooks.instance.trigger('beforeAbify', json)

    if (template === null) {
      template = cmsTemplates.template.getTemplate(json.abe_meta.template, json)
    }

    cmsData.source.getDataList(template, json).then(() => {
      var page = new Page(template, json)

      resolve(page.html)
    })
  })

  return p
}

export default abify
