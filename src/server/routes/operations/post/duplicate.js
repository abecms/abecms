import {Manager, cmsOperations, abeExtend} from '../../../../cli'

var route = async function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  var filepath = req.originalUrl.replace('/abe/operations/duplicate/', '')
  var folderName = filepath.split('/')
  var postName = folderName.pop()
  folderName = folderName.join('/')

  var oldFilePath = req.body.oldFilePath
  delete req.body.oldFilePath

  var result = {
    success: 0
  }

  var jsonDoc = await cmsOperations.duplicate(
    oldFilePath,
    req.body.abe_meta.template,
    folderName,
    postName,
    req,
    false,
    res.user
  )

  if (jsonDoc) {
    result = {
      success: 1,
      json: jsonDoc
    }
  }     

  Manager.instance.events.activity.emit('activity', {
    operation: 'duplicate',
    post: jsonDoc.link,
    user: res.user
  })

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route
