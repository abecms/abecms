import {
  cmsMedia
} from '../../cli'

/**
 * This route returns all the images associated with a name. JSON format
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var route = function(req, res){
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(cmsMedia.image.getAssociatedImageFileFromThumb(req.query.name)))
}

export default route
