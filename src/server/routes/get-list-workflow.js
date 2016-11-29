import path from 'path'
import fse from 'fs-extra'
import Handlebars from 'handlebars'
import {
  abeExtend
  ,coreUtils
  ,config
} from '../../cli'

var route = function(router, req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  var routes = router.stack
  var urls = []
  var html = ''

  Array.prototype.forEach.call(routes, function(route) {
    urls.push({
      url: route.route.path,
      method: Object.keys(route.route.methods)[0].toUpperCase(),
      regex: route.route.path.replace(/\*$/, '') + '.*'
    })
  })

  var page = path.join(__dirname + '/../views/list-workflow.html')
  if (coreUtils.file.exist(page)) {
    html = fse.readFileSync(page, 'utf8')
  }

  var workflowUrl = {}
  Array.prototype.forEach.call(config.users.workflow, (flow) => {
    workflowUrl[flow] = [
      {url: `/abe/operations/${flow}/edit`, action: 'edit', workflow: flow},
      {url: `/abe/operations/${flow}/delete`, action: 'delete', workflow: flow}
    ]
    if (flow != 'publish') {
      workflowUrl[flow].push({url: `/abe/operations/${flow}/reject`, action: 'reject', workflow: flow})
      workflowUrl[flow].push({url: `/abe/operations/${flow}/submit`, action: 'submit', workflow: flow})
    }
  })
  var template = Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    urls: urls,
    user: res.user,
    config: JSON.stringify(config),
    roles: config.users.roles,
    workflow: config.users.workflow,
    workflowUrl: workflowUrl
  })
  
  res.cookie('csrf-token', res.locals.csrfToken)
  return res.send(tmp)
}

export default route