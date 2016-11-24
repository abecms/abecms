import {
  cmsOperations,
  abeExtend
} from '../../../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  let regUrl = /\/abe\/save\/(.*?)\/reject\//
  var workflow = 'draft'
  var match = req.originalUrl.match(regUrl)
  if (match != null && match[1] != null) {
    workflow = match[1]
  }
  var postUrl = req.originalUrl.replace(regUrl, '')
  
  var p = cmsOperations.post.reject(
    postUrl, 
    req.body.json,
    workflow
  )

  p.then((result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  (result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] post-reject.js', e)
  })
}

export default route