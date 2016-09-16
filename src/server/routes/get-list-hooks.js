import path from 'path'
import Handlebars from 'handlebars'
import hooksDefault from "../../hooks/hooks"
import {
  fileUtils,
  FileParser,
  Util,
  cleanSlug,
  getTemplate,
  config,
  save,
  log,
  abeCreate,
  Hooks,
  Plugins
} from '../../cli'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  // var urls = []
  // Array.prototype.forEach.call(routes, function(route) {
  //   urls.push({
  //     url: route.route.path,
  //     method: Object.keys(route.route.methods)[0].toUpperCase(),
  //     regex: "^\\" + route.route.path.replace(/\*$/, '') + ".*?"
  //   })
  // })

  var page = path.join(__dirname + '/../views/list-hooks.html')
  var html = fileUtils.getFileContent(page);
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
  // console.log('Plugins.instance.getHooks()', Plugins.instance.getHooks())

  var template = Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    hooks: allHooks
  })
  
  return res.send(tmp);
}

export default route