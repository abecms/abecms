import {Manager} from '../../cli'

/**
 * This route returns the list of uploaded images in JSON format
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var route = function(req, res) {
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({thumbs: Manager.instance.getThumbsList()}))
}

export default route
