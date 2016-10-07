import xss from 'xss'
import path from 'path'
import pkg from '../../../package'

import {
  FileParser,
  config,
  Page,
  cmsData,
  cmsTemplate,
  coreUtils,
  Hooks,
  Manager
} from '../../cli'

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'

var route = function(req, res, next) {
  if(req.query.filePath){
    var testXSS = xss(req.query.filePath, {
      whiteList: [],
      stripIgnoreTag: true
    })
    if(testXSS !== req.query.filePath){
      res.redirect(`/abe/${req.params[0]}?filePath=${testXSS}`)
      return
    }
  }
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var templatePath = req.params[0]

  var filePath = null
  if(typeof req.query.filePath !== 'undefined' && req.query.filePath !== null) {
    filePath = path.join(config.root, config.draft.url, req.query.filePath.replace(config.root))
  }
  var debugJson = (req.query.debugJson && req.query.debugJson == 'true' ) ? true : false
  var debugJsonKey = (req.query.key) ? req.query.key : false
  var debugHtml = (req.query.debugHtml && req.query.debugHtml == 'true' ) ? true : false

  var isHome = true

  let p = new Promise((resolve) => {

    if(templatePath !== null && filePath !== null) {
      var jsonPath = null
      var linkPath = null
      isHome = false

      var filePathTest = cmsData.revision.getDocumentRevision(req.query.filePath)
      if(typeof filePathTest !== 'undefined' && filePathTest !== null) {
        // filePath = filePathTest.path
        jsonPath = filePathTest.path
        linkPath = filePathTest.abe_meta.link
      }

      if(jsonPath === null || !coreUtils.file.exist(jsonPath)) { 
        res.redirect('/abe/') 
        return 
      } 

      editor(templatePath, jsonPath, linkPath)
        .then((result) => {
          var manager = {}

          FileParser.getAssetsFolder()
          FileParser.getAssets() 

          var revisionFilePath = FileParser.changePathEnv(filePath, config.draft.url)
          var dirPath = path.dirname(revisionFilePath)
          var allDraft = FileParser.getFiles(dirPath, true, 99, new RegExp('\\.' + config.files.templates.extension))

          allDraft = FileParser.getMetas(allDraft, 'draft')
          var breadcrumb = req.params[0].split('/')
          manager.file = {
            revision: cmsData.revision.getFilesRevision(allDraft, cmsData.fileAttr.delete(revisionFilePath))
            ,template: breadcrumb
            ,path: (req.query.filePath) ? path.resolve(req.query.filePath).replace(/^\//, '') : ''
          }
          if(manager.file.revision.length > 0){
            var publishPath = cmsData.fileAttr.delete(manager.file.revision[0].path.replace(new RegExp(`/${config.draft.url}/`), `/${config.publish.url}/`))
            manager.file.isPublished = coreUtils.file.exist(publishPath)
          }

          resolve({
            obj: result,
            manager: manager
          })
        }).catch(function(e) {
          console.error(e)
        })
    }else {
      resolve({
        obj: {},
        manager: {}
      })
    }
  }).catch(function(e) {
    console.error(e) // "oh, no!"
  })

  p.then((result) => {
    var obj = result.obj
    var manager = result.manager
    // let tplUrl = result.tplUrl
  
    manager.home = {
      files: Manager.instance.getList()
    }

    manager.list = req.app.get('projectFiles')
    manager.editConfig = req.app.get('config')
    manager.config = JSON.stringify(config)
    
    var _hasBlock = (obj) ? obj.hasBlock : false
    var _hasSingleBlock = (obj) ? obj.hasSingleBlock : false
    var _template = (filePath) ? '/page/' + req.params[0] + `?filePath=${req.query.filePath}` : false
    var _form = (obj) ? obj.form : false
    var _json = (obj) ? obj.json : false
    var _text = (obj) ? obj.text : false
    // var _file = (tplUrl) ? tplUrl.draft.file : false
    var _filePath = (req.query.filePath) ? req.query.filePath : false
    if (_filePath) {
      _filePath = '/' + _filePath.replace(/^\/+/, '')
    }

    var pageHtml = '' 
    if(typeof _json !== 'undefined' && _json !== null 
      && typeof _json.abe_meta !== 'undefined' && _json.abe_meta !== null) { 
      var text = cmsTemplate.template.getTemplate(_json.abe_meta.template) 
      var page = new Page(_json.abe_meta.template, text, _json, false) 
      pageHtml = page.html.replace(/"/g, '"').replace(/'/g, '\'').replace(/<!--/g, '<ABE!--').replace(/-->/g, '--ABE>')
    } 

    var EditorVariables = {
      pageHtml: pageHtml,
      isHome: isHome,
      abeUrl: '/abe/',
      test: JSON.stringify(locale),
      text: locale,
      templatePath: req.params[0],
      template: _template,
      hasSingleBlock: _hasSingleBlock,
      hasBlock: _hasBlock,
      form: _form,
      urlToSaveFile: _filePath,
      // tplName: _file,
      json: _json,
      config: config,
      Locales: coreUtils.locales.instance.i18n,
      manager: manager,
      express: {
        res: res,
        req: req
      },
      abeVersion: pkg.version,
      nonce: '\'nonce-' + res.locals.nonce + '\''
    }
    EditorVariables = Hooks.instance.trigger('afterVariables', EditorVariables)

    if (debugJson) {
      var dj = _json
      if(debugJsonKey && typeof dj[debugJsonKey] !== 'undefined' && dj[debugJsonKey] !== null) {
        dj = dj[debugJsonKey]
      }
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify(dj))
    }else if (debugHtml) {
      res.set('Content-Type', 'text/plain')
      res.send(_text)
    }else {
      res.render(config.abeEngine, EditorVariables)
    }
  }).catch((e) => {
    console.log('error', e)
  })
}

export default route