import {
  Hooks,
  cmsOperations
} from '../../cli'

var route = function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  cmsOperations.remove.remove(req.query.filePath)

  var result = {
    success: 1,
    file: req.query.filePath
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route