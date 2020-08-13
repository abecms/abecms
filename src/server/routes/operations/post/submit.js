import path from 'path'
import {
  cmsOperations,
  abeExtend,
  cmsData,
  Manager,
  config
} from '../../../../cli'

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

  //console.log('resultroute', result)
  // Auto-republish if the config is setup and the posts limit is not reached
  if (
    operation.workflow === 'publish' &&
    config.publish['auto-republish'] &&
    config.publish['auto-republish'].active
  ) {
    var nbPosts = Manager.instance.getList().length
    if (config.publish['auto-republish'].limit >= nbPosts) {
      var generateArgs = []
      generateArgs.push(
        `ABE_DESTINATION=${path.relative(
          config.root,
          Manager.instance.pathPublish
        )}`
      )

      var proc = abeExtend.process(
        'generate-posts',
        generateArgs,
        data => {
          res.app.emit('generate-posts', data)
        }
      )
      if (proc) {
        res.app.emit('generate-posts', {percent: 0, time: '00:00sec'})
        console.log('generate-posts emitted')
      }
    }
  }

  Manager.instance.events.activity.emit('activity', {
    operation: operation.workflow,
    post: operation.postUrl,
    user: res.user
  })
  res.set('Content-Type', 'application/json')
  //console.log('resultroute2', result.json)
  res.send(JSON.stringify(result))
}

export default route
