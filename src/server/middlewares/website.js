import path from 'path'
import fs from 'fs'

import {coreUtils, config, abeExtend, Manager} from '../../cli'

var middleware = function(req, res, next) {
  if (req.originalUrl.indexOf('/abe') > -1) {
    return next()
  }

  if (
    req.originalUrl === '' ||
    req.originalUrl === '/' ||
    req.originalUrl.indexOf('.') === -1
  ) {
    res.redirect('/abe')
  } else if (
    req.originalUrl.indexOf('.' + config.files.templates.extension) > -1
  ) {
    var html = ''

    var page = path.join(Manager.instance.pathPublish, req.originalUrl)
    if (coreUtils.file.exist(page)) {
      html = fs.readFileSync(page, 'utf8')
    } else {
      return next()
    }

    html = abeExtend.hooks.instance.trigger(
      'beforePreview',
      html,
      req,
      res,
      next
    )
    res.set('Content-Type', 'text/html')
    return res.send(html)
  } else {
    return next()
  }
}

export default middleware
