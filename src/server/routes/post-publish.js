import path from 'path'
import {
  cmsOperations,
  abeExtend,
  Manager
} from '../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var p = cmsOperations.post.publish(
    req.body.filePath, 
    req.body.tplPath,
    req.body.json
  );

  p.then((result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  (result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] post-publish.js', e)
  })
}

export default route