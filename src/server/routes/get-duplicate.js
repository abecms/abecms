import {
  abeDuplicate,
  log,
  Hooks
} from '../../cli'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)

  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
  console.log('duplicate')
  log.write('duplicate', '********************************************')
  log.write('duplicate', 'selectTemplate: ' + req.query.selectTemplate)
  log.write('duplicate', 'filePath: ' + req.query.filePath)
  log.write('duplicate', 'tplName: ' + req.query.tplName)
  var p = abeDuplicate(req.query.oldFilePath, req.query.selectTemplate, req.query.filePath, req.query.tplName, req)

  p.then((resSave) => {
    log.write('duplicate', 'success')
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
    log.write('duplicate', '[ ERROR ]' + e.stack)
    console.error(e.stack)
    reject()
  })
}

export default route