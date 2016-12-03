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

export function draft(filePath, json, workflow = 'draft') {
  var p = new Promise((resolve) => {
    abeExtend.hooks.instance.trigger('beforeDraft', json, filePath)

    var revisionPath = path.join(config.root, config.data.url, filePath.replace(`.${config.files.templates.extension}`, '.json'))
    revisionPath = coreUtils.file.addDateIsoToRevisionPath(revisionPath, workflow)
    var date = coreUtils.file.getDate(revisionPath)
    cmsData.metas.add(json, workflow, date)

    var template = cmsTemplates.template.getTemplate(json.abe_meta.template)

    cmsData.source.getDataList(path.dirname(json.abe_meta.link), template, json)
    .then(() => {

      json['abe_meta'].complete = cmsData.utils.getPercentOfRequiredTagsFilled(template, json)

      // var page = new Page(json.abe_meta.template, template, json, true)
      var result
      if (!cmsOperations.save.saveJson(revisionPath, json)) {
        result = {
          success: 0,
          error: 'cannot json save file'
        }
      }else {
        Manager.instance.updatePostInList(revisionPath)
        result = {
          success: 1,
          json: json
        }
      }
      resolve(result)
    })
  })

  return p
}

export function publish(filePath, json) {
  var p = new Promise((resolve) => {
    abeExtend.hooks.instance.trigger('beforePublish', json, filePath)

    var revisionPath = path.join(config.root, config.data.url, filePath.replace(`.${config.files.templates.extension}`, '.json'))
    var postPath = path.join(config.root, config.publish.url, filePath)
    // revisionPath = coreUtils.file.addDateIsoToRevisionPath(revisionPath, workflow)
    cmsData.metas.add(json, 'publish')

    var template = cmsTemplates.template.getTemplate(json.abe_meta.template)

    cmsData.source.getDataList(path.dirname(json.abe_meta.link), template, json)
    .then(() => {
      json['abe_meta'].complete = cmsData.utils.getPercentOfRequiredTagsFilled(template, json)

      var page = new Page(json.abe_meta.template, template, json, true)
      
      var result
      if (!cmsOperations.save.saveHtml(postPath, page.html)) {
        result = {
          success: 0,
          error: 'cannot save html file'
        }
      }else {
        if (!cmsOperations.save.saveJson(revisionPath, json)) {
          result = {
            success: 0,
            error: 'cannot save json file'
          }
        }else {
          Manager.instance.updatePostInList(revisionPath)
          abeExtend.hooks.instance.trigger('afterPublish', json, filePath)
          result = {
            success: 1,
            json: json
          }
        }
      }
      resolve(result)
    })
  })

  return p
}

export function unpublish(filePath) {
  abeExtend.hooks.instance.trigger('beforeUnpublish', filePath)

  var p = new Promise((resolve, reject) => {
    var revisionPath = path.join(config.root, config.data.url, filePath.replace(`.${config.files.templates.extension}`, '.json'))
    var postPath = path.join(config.root, config.publish.url, filePath)
    if(coreUtils.file.exist(revisionPath)) {
      var json = JSON.parse(JSON.stringify(cmsData.file.get(revisionPath)))
      if(json.abe_meta.publish != null) {
        delete json.abe_meta.publish
      }

      var p = cmsOperations.post.draft(
        filePath, 
        json,
        'draft'
      )

      p.then((result) => {
        cmsOperations.remove.removeFile(revisionPath, postPath)
        abeExtend.hooks.instance.trigger('afterUnpublish', revisionPath, postPath)
        var newRevisionPath = path.join(config.root, config.data.url, result.json.abe_meta.latest.abeUrl.replace(`.${config.files.templates.extension}`, '.json'))
        Manager.instance.updatePostInList(newRevisionPath)
        resolve(result)
      }).catch(function(e) {
        console.error('[ERROR] unpublish', e)
        reject()
      })
    }
  })

  return p
}

export function edit(filePath, json, workflow) {
  var p
  if (workflow === 'publish') {
    p = cmsOperations.post.publish(filePath, json)
  }else {
    p = cmsOperations.post.draft(filePath, json, workflow)
  }

  return p
}

export function submit(filePath, json, workflow) {
  var submitToWorkflow = 'draft'
  var found = false
  Array.prototype.forEach.call(config.users.workflow, (flow) => {
    // if (found) {
    //   found = false
    //   submitToWorkflow = flow
    // }
    if (workflow === flow) {
      submitToWorkflow = flow
    }
  })

  return cmsOperations.post.edit(
    filePath, 
    json, 
    submitToWorkflow
  )
}

export function reject(filePath, json, workflow) {
  abeExtend.hooks.instance.trigger('beforeReject', filePath)

  var rejectToWorkflow
  var found = false
  Array.prototype.forEach.call(config.users.workflow, (flow) => {
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

  var p = new Promise((resolve) => {
    if(json.abe_meta.publish != null) {
      delete json.abe_meta.publish
    }
    var p2 = cmsOperations.post.draft(
        filePath, 
        json,
        rejectToWorkflow
      )
    p2.then((result) => {
      abeExtend.hooks.instance.trigger('afterReject', result)
      resolve(result)
    }).catch(function(e) {
      console.error('[ERROR] reject.js', e)
    })
  })

  return p
}