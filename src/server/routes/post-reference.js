import path from 'path'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'

import {
  config,
  abeExtend,
  Manager
} from '../../cli'

var route = function(req, res, next){
  if(typeof res._header !== 'undefined' && res._header !== null) return
  fse.writeJson(path.join(config.root, req.body.url), JSON.parse(req.body.json), function (err) {
    if(err) console.log("post-reference reference error: ", err)
    Manager.instance.updateReferences()
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify({success: 1}))
  })
}

export default route