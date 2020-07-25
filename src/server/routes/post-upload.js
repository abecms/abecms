import {abeExtend, cmsMedia, Manager} from '../../cli'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if (typeof res._header !== 'undefined' && res._header !== null) return

  var image = cmsMedia.image.saveFile(req)

  image
    .then(function(resp) {
      Manager.instance.addThumbsToList({
        originalFile: resp.filePath,
        thumbFile: resp.thumbnail
      })
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify(resp))
    })
    .catch(function(e) {
      console.error('[ERROR] post-upload', e)
    })
}

export default route
