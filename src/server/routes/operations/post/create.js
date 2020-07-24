import {Manager, cmsOperations, abeExtend} from '../../../../cli'

const route = async function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  const postUrl = req.originalUrl.replace('/abe/operations/create', '')
  const jsonDoc = await cmsOperations.create(
    req.body.abe_meta.template,
    postUrl,
    req.body,
    res.user
  )

  console.log('result du create', jsonDoc)
  var result = {
    success: 1,
    json: jsonDoc
  }

  Manager.instance.events.activity.emit('activity', {
    operation: 'creation',
    post: jsonDoc.link,
    user: res.user
  })
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route
