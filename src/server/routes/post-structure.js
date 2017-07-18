import {cmsStructure} from '../../cli'

var route = function(req, res) {
  if (typeof res._header !== 'undefined' && res._header !== null) return
  cmsStructure.structure.editStructure(req.body.type, req.body.folderPath)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({success: 1}))
}

export default route
