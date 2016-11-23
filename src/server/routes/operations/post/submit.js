import {
  cmsOperations,
  abeExtend
} from '../../../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  let regUrl = /\/abe\/save\/(.*?)\/submit\//
  var workflow = 'draft'
  var match = req.originalUrl.match(regUrl)
  if (match != null && match[1] != null) {
    workflow = match[1]
  }
  var postUrl = req.originalUrl.replace(regUrl, '')
  var json = req.body.json
  
  if (workflow === 'publish') {
    var p = cmsOperations.post.publish(
      postUrl, 
      json
    )
  }else {
    var p = cmsOperations.post.draft(
      postUrl, 
      json, 
      workflow
    )
  }

  p.then((result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  (result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] post-save.js', e)
  })
}

export default route