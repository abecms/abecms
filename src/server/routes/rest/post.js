import path from 'path'

import {
  cmsData,
  coreUtils,
  abeExtend
} from '../../../cli'

/**
 * This route returns the editor page as HTML
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var filePath = req.originalUrl.replace('/abe/rest/post', '')

  if(filePath !== '' && filePath !== '/' && filePath != null) {
    var filePathTest = cmsData.revision.getDocumentRevision(filePath)
    if(typeof filePathTest !== 'undefined' && filePathTest !== null) {
      var jsonPath = filePathTest.path

      if(coreUtils.file.exist(jsonPath)) {
        var json = cmsData.file.get(jsonPath, 'utf8')
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(json))
      }
    }
  }

  // Error

}

export default route
