import {Manager, cmsOperations, abeExtend, cmsData} from '../../../../cli'

var route = async function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if (typeof res._header !== 'undefined' && res._header !== null) return

  var operation = cmsData.regex.getWorkflowFromOperationsUrl(req.originalUrl)

  var result = await cmsOperations.post.submit(
    operation.postUrl,
    req.body.json,
    operation.workflow,
    res.user
  )

  Manager.instance.events.activity.emit('activity', {
    operation: operation.workflow,
    post: operation.postUrl,
    user: res.user
  })

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route
