import {
  abeDuplicate,
  log,
  Hooks
} from '../../cli'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)

  log.write('update', 'selectTemplate: ' + req.query.selectTemplate)
  log.write('update', 'filePath: ' + req.query.filePath)
  log.write('update', 'tplName: ' + req.query.tplName)
  var p = abeDuplicate(req.query.oldFilePath, req.query.selectTemplate, req.query.filePath, req.query.tplName, req, true)

  p.then((resSave) => {
    log.write('update', 'success')
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
    reject()
    log.write('update', '[ ERROR ]' + e)
    console.error(e)
  })
}

export default route