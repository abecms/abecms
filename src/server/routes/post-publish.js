import {
  fileUtils,
  save,
  cleanSlug,
  Hooks,
  Manager
} from '../../cli'

var route = function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var filePath = cleanSlug(req.body.filePath)
  var p = new Promise((resolve) => {
    save(
      fileUtils.getFilePath(filePath),
      req.body.tplPath,
      req.body.json,
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

  p.then((resSave) => {
    save(
      fileUtils.getFilePath(req.body.filePath),
      req.body.tplPath,
      req.body.json,
      '',
      'publish',
      resSave,
      'publish')
      .then((resSave) => {
        if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
          res.set('Content-Type', 'application/json')
          res.send(JSON.stringify({error: resSave.error}))
        }
        var result
        if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
          result = resSave
        }
        if(typeof resSave.json !== 'undefined' && resSave.json !== null){
          result = {
            success: 1,
            json: resSave.json
          }
        }
        Manager.instance.updateList()
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(result))
      }).catch(function(e) {
        console.error('post-publish.js', e)
      })
  }).catch(function(e) {
    console.error('post-publish.js', e)
  })
}

export default route