import mkdirp from 'mkdirp'
import {
  cmsData,
  FileParser,
  fileUtils,
  config,
  Page,
  cmsTemplate,
  cleanSlug
} from '../../cli'

var page = function (req, res, next) {
  var filePath = cleanSlug(req.query.filePath)
  filePath = fileUtils.getFilePath(filePath)
  var html = (req.query.html) ? true : false
  var json = null
  var editor = false
  if(typeof req.body.json !== 'undefined' && req.body.json !== null) {
    editor = true
    if(typeof req.body.json === 'string') {
      json = JSON.parse(req.body.json)
    }else {
      json = req.body.json
    }
  }

  if(typeof filePath !== 'undefined' && filePath !== null) {
    var jsonPath = null
    var linkPath = null

    var filePathTest = cmsData.revision.getDocumentRevision(req.query.filePath)
    if(typeof filePathTest !== 'undefined' && filePathTest !== null) {
      // filePath = filePathTest.path
      jsonPath = filePathTest.path
      linkPath = filePathTest.abe_meta.link
    }

    if(jsonPath === null || !fileUtils.isFile(jsonPath)) { 
      res.status(404).send('Not found')
      return
    } 

    if(typeof json === 'undefined' || json === null) {
      json = FileParser.getJson(jsonPath)
    }
    
    let meta = config.meta.name

    var template = ''
    if(typeof json[meta] !== 'undefined' && json[meta] !== null && json[meta] !== ''
      && json[meta].template !== 'undefined' && json[meta].template !== null && json[meta].template !== '') {
      template = json[meta].template
    }else {
      template = req.params[0]
    }
    var text = cmsTemplate.template.getTemplate(template)

    if (!editor) {

      cmsData.source.getDataList(fileUtils.removeLast(linkPath), text, json)
        .then(() => {
          var page = new Page(template, text, json, html)
          res.set('Content-Type', 'text/html')
          res.send(page.html)
        }).catch(function(e) {
          console.error(e)
        })
    }else {
      text = cmsData.source.removeDataList(text)
      var page = new Page(template, text, json, html)
      res.set('Content-Type', 'text/html')
      res.send(page.html)
    }
  }else {
    // not 404 page if tag abe image upload into each block
    if(/upload%20image/g.test(req.url)) {
      var b64str = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      var img = new Buffer(b64str, 'base64')

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': img.length
      })
      res.end(img) 
    }else {
      res.status(404).send('Not found')
    }
  }
}

export default page