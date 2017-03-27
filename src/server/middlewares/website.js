import path from 'path'
import fse from 'fs-extra'

import {
  coreUtils,
  config,
  abeExtend
} from '../../cli'

var middleware = function(req, res, next) {
  if (req.originalUrl.indexOf('/abe') > -1) {
    return next()
  }

  if (req.originalUrl === '' || req.originalUrl === '/' || req.originalUrl.indexOf('.') === -1) {
    res.redirect('/abe')
  } else if (req.originalUrl.indexOf('.' + config.files.templates.extension) > -1) {

    html = ''

    var page = path.join(config.root, config.publish.url, req.originalUrl)
    if (coreUtils.file.exist(page)) {
      html = fse.readFileSync(page, 'utf8')
    }else {
      return next()
    }

    html = abeExtend.hooks.instance.trigger('beforePreview', html, req, res, next)
    res.set('Content-Type', 'text/html')
    return res.send(html)

  } else {
    return next()
  }
}

export default middleware