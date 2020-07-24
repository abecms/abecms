import path from 'path'

import {
  cmsData,
  Page,
  cmsOperations,
  cmsTemplates,
  coreUtils,
  config,
  abeExtend,
  Manager
} from '../../'

export async function draft(postUrl, json, workflow = 'draft', user) {
  abeExtend.hooks.instance.trigger('beforeDraft', json, postUrl)

  const docPath = cmsData.utils.getDocRelativePathFromPostUrl(postUrl)
  const revisionPath = coreUtils.file.addDateIsoToRevisionPath(docPath, workflow)
  const date = coreUtils.file.getDate(revisionPath)
  let result = {
    success: 0,
    error: 'cannot json save file'
  }
  cmsData.metas.add(json, workflow, date, user)

  const template = cmsTemplates.template.getTemplate(
    json.abe_meta.template,
    json
  )

  await cmsData.source.getDataList(template, json)
  json['abe_meta'].complete = cmsData.utils.getPercentOfRequiredTagsFilled(
    template,
    json
  )

  var success = await cmsOperations.save.saveJson(revisionPath, json)

  if (success) {
    await Manager.instance.updatePostInList(revisionPath)
    result = {
      success: 1,
      json: json
    }
  }

  return result
}

export async function publish(postUrl, json, user) {
  abeExtend.hooks.instance.trigger('beforePublish', json, postUrl)

  const docRelativePath = cmsData.utils.getDocRelativePathFromPostUrl(postUrl)
  const postPath = path.join(Manager.instance.pathPublish, postUrl)
  cmsData.metas.add(json, 'publish', null, user)

  var template = cmsTemplates.template.getTemplate(
    json.abe_meta.template,
    json
  )

  await cmsData.source.getDataList(template, json)
  json['abe_meta'].complete = cmsData.utils.getPercentOfRequiredTagsFilled(
    template,
    json
  )

  var page = new Page(template, json, true)

  var result
  if (!cmsOperations.save.saveHtml(postPath, page.html)) {
    result = {
      success: 0,
      error: 'cannot save html file'
    }
  } else {
    if (!await cmsOperations.save.saveJson(docRelativePath, json)) {
      result = {
        success: 0,
        error: 'cannot save json file'
      }
    } else {
      Manager.instance.updatePostInList(docRelativePath)
      abeExtend.hooks.instance.trigger('afterPublish', json, postUrl)
      result = {
        success: 1,
        json: json
      }
    }
  }
  // are there additional templates to export?
  if (json.abe_meta.relatedTemplates) {
    const relatedTemplates = Object.keys(json.abe_meta.relatedTemplates)
    await Promise.all(relatedTemplates.map(async (key, index) => {
      const relatedTemplate = json.abe_meta.relatedTemplates[key]

      if (relatedTemplate.template && relatedTemplate.path) {
        const relTemplate = cmsTemplates.template.getTemplate(
          relatedTemplate.template,
          json
        )
        let extension = config.files.templates.extension
        if (relatedTemplate.extension) extension = relatedTemplate.extension
        const fileName =
          path.basename(postUrl, '.' + config.files.templates.extension) +
          '.' +
          extension
        const relPath = path.join(
          Manager.instance.pathPublish,
          relatedTemplate.path,
          fileName
        )

        await cmsData.source.getDataList(relTemplate, json)
        const page = new Page(relTemplate, json, true)
        cmsOperations.save.saveHtml(relPath, page.html)
      }
    }))
  }

  return result
}

export async function unpublish(postUrl, user) {
  abeExtend.hooks.instance.trigger('beforeUnpublish', postUrl)
  const docPath = cmsData.utils.getDocPathFromPostUrl(postUrl)
  const postPath = path.join(Manager.instance.pathPublish, postUrl)
  var json = await cmsData.revision.getDoc(docPath)
  if (json.abe_meta.publish != null) {
    delete json.abe_meta.publish
  }

  var result = await cmsOperations.post.draft(postUrl, json, 'draft', user)
  cmsOperations.remove.removeRevision(docPath)
  cmsOperations.remove.removePost(postPath)
  // are there additional templates to export?
  if (result.json.abe_meta.relatedTemplates) {
    Object.keys(result.json.abe_meta.relatedTemplates).map(function(
      key,
      index
    ) {
      const relatedTemplate = result.json.abe_meta.relatedTemplates[key]

      if (relatedTemplate.template && relatedTemplate.path) {
        const relTemplate = cmsTemplates.template.getTemplate(
          relatedTemplate.template,
          json
        )
        let extension = config.files.templates.extension
        if (relatedTemplate.extension)
          extension = relatedTemplate.extension
        const fileName =
          path.basename(
            postUrl,
            '.' + config.files.templates.extension
          ) +
          '.' +
          extension
        const relatedPostPath = path.join(
          Manager.instance.pathPublish,
          relatedTemplate.path,
          fileName
        )
        cmsOperations.remove.removePost(relatedPostPath)
      }
    })
  }

  const newDocPath = cmsData.utils.getDocPathFromLinkStatusDate(
    result.json
  )
  Manager.instance.updatePostInList(newDocPath)

  abeExtend.hooks.instance.trigger(
    'afterUnpublish',
    docPath,
    postPath,
    result.json
  )
  
  return result.json
}

export async function submit(postUrl, json, workflow, user) {
  var result
  if (workflow === 'publish') {
    result = await cmsOperations.post.publish(postUrl, json, user)
  } else {
    result = await cmsOperations.post.draft(postUrl, json, workflow, user)
  }

  return result
}

export async function reject(filePath, json, workflow, user) {
  abeExtend.hooks.instance.trigger('beforeReject', filePath)

  var rejectToWorkflow
  var found = false
  Array.prototype.forEach.call(config.users.workflow, flow => {
    if (workflow === flow) {
      found = true
    }
    if (!found) {
      rejectToWorkflow = flow
    }
  })
  if (!found) {
    rejectToWorkflow = 'draft'
  }

  if (json.abe_meta.publish != null) {
    delete json.abe_meta.publish
  }
  var result = await cmsOperations.post.draft(filePath, json, rejectToWorkflow, user)
  abeExtend.hooks.instance.trigger('afterReject', result)

  return result
}
