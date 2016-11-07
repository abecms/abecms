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

export function draft(filePath, tplPath, json, workflow = 'draft') {
  var p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforeDraft', json, filePath, tplPath)

    var revisionPath = path.join(config.root, config.data.url, filePath.replace(`.${config.files.templates.extension}`, '.json'))
    revisionPath = coreUtils.file.addDateIsoToRevisionPath(revisionPath, workflow)
    var date = coreUtils.file.getDate(revisionPath)
    cmsData.metas.add(json, workflow, date)

    var template = cmsTemplates.template.getTemplate(json.abe_meta.template)

    cmsData.source.getDataList(path.dirname(json.abe_meta.link), template, json)
    .then(() => {

      json['abe_meta'].complete = cmsOperations.save.checkRequired(template, json)

      // var page = new Page(json.abe_meta.template, template, json, true)
      var result
      if (!cmsOperations.save.saveJson(revisionPath, json)) {
        result = {
          success: 0,
          error: "cannot json save file"
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

export function publish(filePath, tplPath, json) {
  var p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforePublish', json, filePath, tplPath)

    var revisionPath = path.join(config.root, config.data.url, filePath.replace(`.${config.files.templates.extension}`, '.json'))
    var postPath = path.join(config.root, config.publish.url, filePath)
    // revisionPath = coreUtils.file.addDateIsoToRevisionPath(revisionPath, workflow)
    cmsData.metas.add(json, "publish")

    var template = cmsTemplates.template.getTemplate(json.abe_meta.template)

    cmsData.source.getDataList(path.dirname(json.abe_meta.link), template, json)
    .then(() => {

      json['abe_meta'].complete = cmsOperations.save.checkRequired(template, json)

      var page = new Page(json.abe_meta.template, template, json, true)
      
      var result
      if (!cmsOperations.save.saveHtml(postPath, page.html)) {
        result = {
          success: 0,
          error: "cannot html save file"
        }
      }else {
        if (!cmsOperations.save.saveJson(revisionPath, json)) {
          result = {
            success: 0,
            error: "cannot json save file"
          }
        }else {
          Manager.instance.updatePostInList(revisionPath)
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
  var tplUrl = cmsData.file.fromUrl(path.join(config.publish.url, filePath))
  if(coreUtils.file.exist(tplUrl.json.path)) {
    var json = JSON.parse(JSON.stringify(cmsData.file.get(tplUrl.json.path)))
    if(json.abe_meta.publish != null) {
      delete json.abe_meta.publish
    }

    var p = draft(
      filePath, 
      json.abe_meta.template,
      json,
      "draft"
    )

    p.then((result) => {
      cmsOperations.remove.removeFile(tplUrl.publish.path, tplUrl.publish.json)
      abeExtend.hooks.instance.trigger('afterUnpublish', tplUrl.publish.path, tplUrl.publish.json)
      Manager.instance.updatePostInList(resSave.jsonPath)
    }).catch(function(e) {
      console.error('[ERROR] post-publish.js', e)
    })
  }
}

export function reject(filePath, tplPath, json) {
  abeExtend.hooks.instance.trigger('beforeReject', filePath)

  var p = new Promise((resolve, reject) => {
    var tplUrl = cmsData.file.fromUrl(path.join(config.publish.url, filePath))
    // if(coreUtils.file.exist(tplUrl.json.path)) {
      var json = JSON.parse(JSON.stringify(cmsData.file.get(tplUrl.json.path)))
      if(json.abe_meta.publish != null) {
        delete json.abe_meta.publish
      }

      var p2 = draft(
        filePath, 
        json.abe_meta.template,
        json,
        "draft"
      )

      p2.then((result) => {
        abeExtend.hooks.instance.trigger('afterReject', result)
        Manager.instance.updatePostInList(resSave.jsonPath)
        resolve(result)
      }).catch(function(e) {
        console.error('[ERROR] post-publish.js', e)
      })
    // }
  })

  // var p = new Promise((resolve, reject) => {
  //     cmsOperations.save.save(
  //       path.join(config.root, config.draft.url, filePath.replace(config.root)),
  //       tplPath,
  //       json,
  //       '',
  //       'draft')
  //       .then((resSave) => {
          // abeExtend.hooks.instance.trigger('afterReject', result)
          // Manager.instance.updatePostInList(resSave.jsonPath)
          // resolve(result)
  //       }).catch(function(e) {
  //         console.error(e)
  //       })
  //   })

  return p
}