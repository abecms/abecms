import path from 'path'

import {
  cmsData,
  cmsOperations,
  coreUtils,
  config,
  abeExtend,
  Manager
} from '../../'

export function publish(filePath, tplPath, json) {
  var p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforePublish', json, filePath, tplPath)
    var p1 = new Promise((resolve) => {
      cmsOperations.save.save(
        path.join(config.root, config.draft.url, filePath.replace(config.root)),
        tplPath,
        json,
        '',
        'draft',
        null,
        'publish')
        .then(() => {
          resolve()
        }).catch(function(e) {
          console.error(e)
        })
    })

    p1.then((resSave) => {
      cmsOperations.save.save(
        path.join(config.root, config.draft.url, filePath.replace(config.root)),
        tplPath,
        json,
        '',
        'publish',
        resSave,
        'publish')
        .then((resSave) => {
          var result
          if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
            result = {
              success: 0,
              error: resSave.error
            }
          } else if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
            result = resSave
          } else if(typeof resSave.json !== 'undefined' && resSave.json !== null){
            result = {
              success: 1,
              json: resSave.json
            }
          }
          abeExtend.hooks.instance.trigger('afterPublish', result)
          Manager.instance.updateList()
          resolve(result)
        }).catch(function(e) {
          console.error('post-publish.js', e)
          var result = {
            success: 0,
            error: 'post-publish error'
          }
          abeExtend.hooks.instance.trigger('afterPublish', result)
          resolve(result)
        })
    }).catch(function(e) {
      console.error('post-publish.js', e)
      var result = {
        success: 0,
        error: 'post-publish error'
      }
      abeExtend.hooks.instance.trigger('afterPublish', result)
      resolve(result)
    })
  })

  return p
}

export function unpublish(filePath) {
  abeExtend.hooks.instance.trigger('beforeUnpublish', filePath)
  filePath = coreUtils.slug.clean(filePath)
  var tplUrl = cmsData.file.fromUrl(path.join(config.publish.url, filePath))
  if(coreUtils.file.exist(tplUrl.json.path)) {
    var json = JSON.parse(JSON.stringify(cmsData.file.get(tplUrl.json.path)))
    if(json.abe_meta.publish != null) {
      delete json.abe_meta.publish
    }

    cmsOperations.save.save(
      path.join(config.root, config.draft.url, json.abe_meta.link.replace(config.root)),
      json.abe_meta.template,
      json,
      '',
      'reject',
      null,
      'reject'
    )
    .then(() => {
      cmsOperations.remove.removeFile(tplUrl.publish.path, tplUrl.publish.json)
      abeExtend.hooks.instance.trigger('afterUnpublish', tplUrl.publish.path, tplUrl.publish.json)
      Manager.instance.updateList()
    })
  }
}