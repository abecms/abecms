import {
  cmsReference
} from '../../cli'

var route = function(req, res, next){
  if(typeof res._header !== 'undefined' && res._header !== null) return
  cmsReference.reference.saveFile(req.body.url, req.body.json)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({success: 1}))
}

export default route