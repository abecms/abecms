import path from 'path'
import {cmsData, config, Page, cmsTemplates, coreUtils} from '../../cli'

var page = async function(req, res) {
  var html = req.query.html ? true : false
  var json = null
  var editor = false
  if (typeof req.body.json !== 'undefined' && req.body.json !== null) {
    editor = true
    if (typeof req.body.json === 'string') {
      json = JSON.parse(req.body.json)
    } else {
      json = req.body.json
    }
  }

  var filepath = req.originalUrl.replace('/abe/page/', '')

  if (typeof filepath !== 'undefined' && filepath !== null) {
    var jsonPath = null
    var linkPath = null

    var filePathTest = cmsData.revision.getDocumentRevision(filepath)
    if (typeof filePathTest !== 'undefined' && filePathTest !== null) {
      jsonPath = filePathTest.path
      linkPath = filePathTest.abe_meta.link
    }

    if (jsonPath === null) {
      res.status(404).send('Not found')
      return
    }

    if (typeof json === 'undefined' || json === null) {
      json = await cmsData.revision.getDoc(jsonPath)
    }

    let meta = config.meta.name

    var templateId = ''
    if (json[meta] && json[meta].template) {
      templateId = json[meta].template
    } else {
      templateId = req.params[0]
    }
    var text = cmsTemplates.template.getTemplate(templateId, json)

    if (!editor) {
      cmsData.source
        .updateJsonWithExternalData(text, json)
        .then(() => {
          var page = new Page(text, json, html)
          res.set('Content-Type', 'text/html')
          res.send(page.html)
        })
        .catch(function(e) {
          console.error(e)
        })
    } else {
      text = cmsData.source.removeDataList(text)
      var page = new Page(text, json, html)
      res.set('Content-Type', 'text/html')
      res.send(page.html)
    }
  } else {
    // not 404 page if tag abe image upload into each block
    if (/upload%20image/g.test(req.url)) {
      var b64str =
        'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      var img = new Buffer(b64str, 'base64')

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': img.length
      })
      res.end(img)
    } else {
      res.status(404).send('Not found')
    }
  }
}

export default page
