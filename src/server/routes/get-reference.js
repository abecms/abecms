import {
  Manager
} from '../../cli'

var route = function(req, res, next){
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({reference: Manager.instance.getReferences()}))
}

export default route