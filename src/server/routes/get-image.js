import {
  cmsMedia
} from '../../cli'

var route = function(req, res){
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(cmsMedia.image.getAssociatedImageFileFromThumb(req.query.name)))
}

export default route
