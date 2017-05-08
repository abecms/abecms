import {
  Manager,
  cmsOperations,
  abeExtend
} from '../../../../cli'

const route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)

  const postUrl = req.originalUrl.replace('/abe/operations/create', '')
  const p = cmsOperations.create(req.body.abe_meta.template, postUrl, req.body, res.user)

  p.then((resSave) => {
    var result = {
      success: 1,
      json: resSave
    }

    Manager.instance.events.activity.emit('activity', {operation: 'creation', post: resSave.link, user: res.user})
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  },
  () => {
    var result = {
      success: 0
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  })
}

export default route