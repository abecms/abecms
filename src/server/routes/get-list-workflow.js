import pkg from '../../../package'
import path from 'path'
import fs from 'fs'
import Handlebars from 'handlebars'
import {abeExtend, coreUtils, config} from '../../cli'

/**
 * this route returns the workflow list in HTML format
 * @param  {[type]}   router [description]
 * @param  {[type]}   req    [description]
 * @param  {[type]}   res    [description]
 * @param  {Function} next   [description]
 * @return {[type]}          [description]
 */
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
    html = fs.readFileSync(page, 'utf8')
  }

  var workflowUrl = {}
  var previous = ''
  var nextWorkflow = ''
  Array.prototype.forEach.call(config.users.workflow, flow => {
    var current = false
    if (flow != 'publish') {
      Array.prototype.forEach.call(config.users.workflow, flowCheck => {
        if (current) {
          nextWorkflow = flowCheck
          current = false
        }
        if (flow === flowCheck) {
          current = true
        }
      })
    } else {
      nextWorkflow = 'draft'
    }
    workflowUrl[flow] = [
      {
        url: `/abe/operations/edit/${flow}`,
        action: 'edit',
        workflow: flow,
        previous: previous,
        next: nextWorkflow
      },
      {
        url: `/abe/operations/delete/${flow}`,
        action: 'delete',
        workflow: flow,
        previous: previous,
        next: nextWorkflow
      },
      {
        url: `/abe/operations/submit/${flow}`,
        action: 'submit',
        workflow: flow,
        previous: previous,
        next: nextWorkflow
      }
    ]

    if (flow !== 'draft') {
      workflowUrl[flow].push({
        url: `/abe/operations/reject/${flow}`,
        action: 'reject',
        workflow: flow,
        previous: previous,
        next: nextWorkflow
      })
    }
    previous = flow
  })
  var template = Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    urls: urls,
    user: res.user,
    config: config,
    roles: config.users.roles,
    workflow: config.users.workflow,
    isWorkflow: 1,
    workflowUrl: workflowUrl,
    manager: {
      config: JSON.stringify(config)
    },
    abeVersion: pkg.version
  })

  res.cookie('csrf-token', res.locals.csrfToken)
  return res.send(tmp)
}

export default route
