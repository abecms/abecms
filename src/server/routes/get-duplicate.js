import {
  cmsOperations,
  abeExtend
} from '../../cli'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  var p = cmsOperations.duplicate(req.query.oldFilePath, req.query.selectTemplate, req.query.filePath, req.query.tplName, req)

  p.then((resSave) => {
    var result = {
      success: 1,
      json: resSave
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  () => {
    var result = {
      success: 0
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] get-duplicate.js', e)
  })
}

export default route