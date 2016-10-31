import {
  Manager
} from '../../cli'

var route = function(req, res){
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({reference: Manager.instance.getReferences()}))
}

export default route
