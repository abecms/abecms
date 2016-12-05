import {
  cmsMedia
} from '../../cli'

var route = function(req, res){
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({thumbs: cmsMedia.image.getThumbsList()}))
}

export default route
