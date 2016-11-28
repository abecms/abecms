import {
  abeExtend
  ,cmsOperations
  ,cmsData
} from '../../../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var operation = cmsData.regex.getWorkflowFromOperationsUrl(req.originalUrl)

  cmsOperations.remove.remove(operation.postUrl)

  var result = {
    success: 1,
    file: operation.postUrl
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route