import path from 'path'
import Handlebars from 'handlebars'
import {
  fileUtils,
  Hooks
} from '../../cli'

var route = function(router, req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  var routes = router.stack
  var urls = []
  Array.prototype.forEach.call(routes, function(route) {
    urls.push({
      url: route.route.path,
      method: Object.keys(route.route.methods)[0].toUpperCase(),
      regex: '^\\' + route.route.path.replace(/\*$/, '') + '.*?'
    })
  })

  var page = path.join(__dirname + '/../views/list-url.html')
  var html = fileUtils.getFileContent(page)


  var template = Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    urls: urls
  })
  
  return res.send(tmp)

  res.set('Content-Type', 'text/html')
  res.send('working !')
}

export default route