import path from 'path'
import {config, abeExtend, cmsReference, Manager} from '../../cli'

var route = function(req, res) {
  if (typeof res._header !== 'undefined' && res._header !== null) return
  cmsReference.reference.saveFile(req.body.url, req.body.json)
  if (
    config.publish['auto-republish'] &&
    config.publish['auto-republish'].active
  ) {
    var nbPosts = Manager.instance.getList().length
    if (config.publish['auto-republish'].limit >= nbPosts) {

      var generateArgs = []
      generateArgs.push(`ABE_DESTINATION=${path.relative(config.root, Manager.instance.pathPublish)}`)

      var proc = abeExtend.process('generate-posts', generateArgs, data => {
        res.app.emit('generate-posts', data)
      })
      if (proc) {
        res.app.emit('generate-posts', {percent: 0, time: '00:00sec'})
        console.log('generate-posts emitted')
      }
    }
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({success: 1}))
}

export default route
