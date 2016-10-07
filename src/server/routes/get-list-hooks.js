import path from 'path'
import Handlebars from 'handlebars'
import hooksDefault from '../../hooks/hooks'
import {
  coreUtils,
  Hooks
} from '../../cli'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)

  var page = path.join(__dirname + '/../views/list-hooks.html')
  var html = coreUtils.file.getContent(page)
  var allHooks = []

  Array.prototype.forEach.call(Object.keys(hooksDefault), (hook) => {
    var hookString = hooksDefault[hook] + ''
    var match = /\((.*?)\)/.exec(hookString)
    var matchReturn = /return ([a-z1-Z-1-9]+)/.exec(hookString)
    allHooks.push({
      name: hook,
      params: (match) ? match[1] : 'null',
      back: (matchReturn) ? matchReturn[1].replace(';', '') : 'null'
    })
  })

  var template = Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    hooks: allHooks
  })
  
  return res.send(tmp)
}

export default route