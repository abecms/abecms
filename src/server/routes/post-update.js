import {
  cmsOperations,
  abeExtend
} from '../../cli'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  var filepath = req.originalUrl.replace('/abe/update', '')
  var folderName = filepath.split('/')
  var postName = folderName.pop()
  folderName = folderName.join('/')

  var p = cmsOperations.duplicate(req.body.oldFilePath, req.body.selectTemplate, folderName, postName, req, true)

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
    console.error(e)
  })
}

export default route