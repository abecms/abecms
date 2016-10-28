import {
  abeExtend,
  cmsOperations
} from '../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var filepath = req.originalUrl.replace('/abe/delete', '')

  cmsOperations.remove.remove(filepath)

  var result = {
    success: 1,
    file: filepath
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route