import path from 'path'

import {cmsData, Page, cmsTemplates, abeExtend} from '../../'

/**
 * This function takes a json and optionally a template (in HTML) and returns its abified version (HTML)
 * @param  {[type]} json     [description]
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
export async function abify(json, template = null) {
    abeExtend.hooks.instance.trigger('beforeAbify', json)

    if (template === null) {
      template = cmsTemplates.template.getTemplate(json.abe_meta.template, json)
    }

    await cmsData.source.updateJsonWithExternalData(template, json)
    const page = new Page(template, json)

    return page.html
}
