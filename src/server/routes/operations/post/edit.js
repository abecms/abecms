import {
  cmsOperations
  ,abeExtend
  ,cmsData
} from '../../../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var operation = cmsData.regex.getWorkflowFromOperationsUrl(req.originalUrl)
console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * $*')
console.log('operation.postUrl, req.body.json, operation.workflow', operation.postUrl, 
    req.body.json, 
    operation.workflow)

  var p = cmsOperations.post.submit(
    operation.postUrl, 
    req.body.json, 
    operation.workflow
  )

  p.then((result) => {
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