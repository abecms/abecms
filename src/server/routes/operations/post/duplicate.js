import {
  Manager,
  cmsOperations,
  abeExtend
} from '../../../../cli'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  var filepath = req.originalUrl.replace('/abe/operations/duplicate', '')
  var folderName = filepath.split('/')
  var postName = folderName.pop()
  folderName = folderName.join('/')

  var oldFilePath = req.body.oldFilePath 
  delete req.body.oldFilePath 
 
  var p = cmsOperations.duplicate(oldFilePath, req.body.abe_meta.template, folderName, postName, req, false, res.user)

  p.then((resSave) => {
    var result = {
      success: 1,
      json: resSave
    }

    Manager.instance.events.activity.emit("activity", {operation: 'duplicate', post: resSave.link, user: res.user})
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  () => {
    var result = {
      success: 0
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] get-duplicate.js', e)
  })
}

export default route