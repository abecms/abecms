import path from 'path'
import url from 'url'
import {cmsData, abeExtend} from '../../cli'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if (typeof res._header !== 'undefined' && res._header !== null) return

  var sourceString = req.body.sourceString
  var prefillQuantity = req.body.prefillQuantity != null && req.body.prefillQuantity != 'null' ? `prefill-quantity="${req.body.prefillQuantity}"` : ''
  var key = req.body.key
  var jsonPage = req.body.json ? JSON.parse(JSON.stringify(req.body.json)) : {abe_meta: {}}
  jsonPage.abe_meta.link = url.parse(req.header('referer')).path.replace('/abe/editor', '')

  jsonPage[key] = null

  var request = `{{abe type="data" key="${key}" source="${sourceString}" prefill="true" ${prefillQuantity} editable="true"}}`
  var obj = cmsData.attributes.getAll(request, jsonPage)

  cmsData.source.requestList(obj, request, jsonPage).then(() => {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(jsonPage[key]))
  })
}

export default route
