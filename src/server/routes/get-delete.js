import {
  FileParser,
  Hooks,
  cleanSlug
} from '../../cli'

var route = function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var filePath = cleanSlug(req.query.filePath)
  var dirPath = FileParser.deleteFile(filePath)

  var result = {
    success: 1,
    file: req.query.filePath
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route