import path from 'path'
import fse from 'fs-extra'
import Handlebars from 'handlebars'
import {
  Hooks
} from '../../cli'

var route = function(router, req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  var routes = router.stack
  var urls = []
  var html = ''

  Array.prototype.forEach.call(routes, function(route) {
    urls.push({
      url: route.route.path,
      method: Object.keys(route.route.methods)[0].toUpperCase(),
      regex: '^\\' + route.route.path.replace(/\*$/, '') + '.*?'
    })
  })

  var page = path.join(__dirname + '/../views/list-url.html')
  if (exist(page)) {
    html = fse.readFileSync(page, 'utf8')
  }

  var template = Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    urls: urls
  })
  
  return res.send(tmp)

  res.set('Content-Type', 'text/html')
  res.send('working !')
}

export default route