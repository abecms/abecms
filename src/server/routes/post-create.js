import {
  Manager,
  cmsOperations,
  abeExtend
} from '../../cli'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  var filepath = req.originalUrl.replace('/abe/create', '')
  var folderName = filepath.split('/')
  var postName = folderName.pop()
  folderName = folderName.join('/')

  var p = cmsOperations.create(req.body.abe_meta.template, folderName, postName, req, req.body)

  p.then((resSave) => {
    var result = {
      success: 1,
      json: resSave
    }
    var username = ''
    if(res.user && res.user.username){
      username = res.user.username
    }
    Manager.instance.events.activity.emit("activity", {operation: 'creation', post: resSave.link, user: username})
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  () => {
    var result = {
      success: 0
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  })
}

export default route