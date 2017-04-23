import {
  Manager,
  cmsOperations,
  abeExtend,
  cmsData
} from '../../../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var operation = cmsData.regex.getWorkflowFromOperationsUrl(req.originalUrl)

  var p = cmsOperations.post.submit(
    operation.postUrl, 
    req.body.json, 
    operation.workflow,
    res.user
  )

  p.then((result) => {

    Manager.instance.events.activity.emit("activity", {operation: operation.workflow, post: operation.postUrl, user: res.user})
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  (result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] post-save.js', e)
  })
}

export default route