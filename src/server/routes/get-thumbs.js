import {
  Manager
} from '../../cli'

var route = function(req, res){
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({thumbs: Manager.instance.getThumbsList()}))
}

export default route
