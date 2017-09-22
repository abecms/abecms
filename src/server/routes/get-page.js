import path from 'path'
import {abeExtend, config} from '../../cli'

import pageHelper from '../helpers/page'

/**
 * This route returns the post as draft in HTML format
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if (typeof res._header !== 'undefined' && res._header !== null) return

  var filePath = req.originalUrl.replace('/abe/page', '')

  if(filePath != null && path.extname(filePath) != `.${config.files.templates.extension}`){
    next()
    return
  }

  pageHelper(req, res, next)
}

export default route
