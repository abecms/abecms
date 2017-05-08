import {
  Manager,
  cmsOperations
  ,abeExtend
} from '../../../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var postUrl = req.originalUrl.replace(/\/abe\/operations\/unpublish\//, '')

  cmsOperations.post.unpublish(postUrl, res.user)

  var result = {
    success: 1,
    file: postUrl
  }

  Manager.instance.events.activity.emit('activity', {operation: 'unpublish', post: postUrl, user: res.user})
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route