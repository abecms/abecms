import {config, cmsStructure} from '../../cli'

var route = function(req, res) {
  if (typeof res._header !== 'undefined' && res._header !== null) return

  const type = req.body.type
  const folderPath = `${config.structure.url}/${req.body.folderPath}`
  let oldFolderPath = null
  if (req.body.oldFolderPath) {
    oldFolderPath = `${config.structure.url}/${req.body.oldFolderPath}`
  }

  cmsStructure.structure.editStructure(type, folderPath, oldFolderPath)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({success: 1}))
}

export default route
