import {
  cmsOperations,
  abeExtend
} from '../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var filePath = req.originalUrl.replace('/abe/draft', '')
  var json = req.body.json

  var p = cmsOperations.post.draft(
    filePath, 
    json.abe_meta.template,
    json
  )

  p.then((result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  (result) => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }).catch(function(e) {
    console.error('[ERROR] post-draft.js', e)
  })
}

export default route