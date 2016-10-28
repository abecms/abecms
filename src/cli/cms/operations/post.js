import path from 'path'

import {
  cmsData,
  cmsOperations,
  coreUtils,
  config,
  abeExtend,
  Manager
} from '../../'

export function draft(filePath, tplPath, json, workflow = 'draft', type = 'draft') {
  var p = new Promise((resolve, reject) => {
    abeExtend.hooks.instance.trigger('beforeDraft', json, filePath, tplPath)
    cmsOperations.save.save(
      path.join(config.root, config.draft.url, filePath.replace(config.root)),
      tplPath,
      json,
      '',
      workflow,
      null,
      type)
      .then((resSave) => {
        var result
        if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
          result = {error: resSave.error}
        }else if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
          result = resSave
        }else if(typeof resSave.json !== 'undefined' && resSave.json !== null){
          Manager.instance.updateList()
          result = {
            success: 1,
            json: resSave.json
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
          console.error('post.js', e)
          var result = {
            success: 0,
            error: 'publish error'
          }
          abeExtend.hooks.instance.trigger('afterPublish', result)
          resolve(result)
        })
    }).catch(function(e) {
      console.error('post.js', e)
      var result = {
        success: 0,
        error: 'publish error'
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

export function reject(filePath, tplPath, json) {
  abeExtend.hooks.instance.trigger('beforeReject', filePath)
  var p = new Promise((resolve, reject) => {
    var p1 = new Promise((resolve) => {
      cmsOperations.save.save(
        path.join(config.root, config.draft.url, filePath.replace(config.root)),
        tplPath,
        json,
        '',
        'draft',
        null,
        'reject')
        .then((resSave) => {
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
        'reject',
        resSave,
        'reject')
        .then((resSave) => {
          var result
          if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
            result = {
              success: 0,
              error: resSave.error
            }
          } else if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
            resSave.success = 1
            result = resSave
          } else if(typeof resSave.json !== 'undefined' && resSave.json !== null){
            result = {
              success: 1,
              json: resSave.json
            }
          }
          abeExtend.hooks.instance.trigger('afterReject', result)
          Manager.instance.updateList()
          resolve(result)
        })
    }).catch(function(e) {
      console.error(e)
      var result = {
        success: 0,
        error: 'reject error'
      }
      abeExtend.hooks.instance.trigger('afterReject', result)
      resolve(result)
    })
  })

  return p
}