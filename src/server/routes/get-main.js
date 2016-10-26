import xss from 'xss'
import path from 'path'
import pkg from '../../../package'

import {
  config,
  Page,
  cmsData,
  cmsTemplates,
  coreUtils,
  abeExtend,
  Manager
} from '../../cli'

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'

var route = function(req, res, next) {
  var filePath = req.originalUrl.replace('/abe', '')
  if (filePath === '' || filePath === '/') {
    filePath = null
  }

  if(filePath != null){
    var testXSS = xss(filePath, {
      whiteList: [],
      stripIgnoreTag: true
    })
    if(testXSS !== filePath){
      filePath = testXSS
    }
  }

  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var isHome = true
  var jsonPath = null
  var linkPath = null
  var templatePath = null

  let p = new Promise((resolve) => {

    if(filePath != null) {
      isHome = false

      var filePathTest = cmsData.revision.getDocumentRevision(filePath)
      if(typeof filePathTest !== 'undefined' && filePathTest !== null) {
        jsonPath = filePathTest.path
        linkPath = filePathTest.abe_meta.link
        templatePath = filePathTest.abe_meta.template
      }

      if(jsonPath === null || !coreUtils.file.exist(jsonPath)) { 
        res.redirect('/abe/') 
        return 
      }

      editor(templatePath, jsonPath, linkPath)
        .then((result) => {
          resolve(result)
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
    var obj = result
    var manager = {}
  
    manager.home = {
      files: Manager.instance.getList()
    }

    manager.list = Manager.instance.getStructureAndTemplates()
    manager.editConfig = req.app.get('config')
    manager.config = JSON.stringify(config)
    
    var _hasBlock = (obj) ? obj.hasBlock : false
    var _hasSingleBlock = (obj) ? obj.hasSingleBlock : false
    var _template = (filePath) ? '/page/' + req.params[0] + `?filePath=${filePath}` : false
    var _form = (obj) ? obj.form : false
    var _json = (obj) ? obj.json : false
    var _text = (obj) ? obj.text : false
    // var _file = (tplUrl) ? tplUrl.draft.file : false
    var _filePath = (filePath) ? filePath : false
    if (_filePath) {
      _filePath = '/' + _filePath.replace(/^\/+/, '')
    }

    var pageHtml = ''
    if(typeof _json !== 'undefined' && _json !== null 
      && typeof _json.abe_meta !== 'undefined' && _json.abe_meta !== null) {

      var text = cmsTemplates.template.getTemplate(_json.abe_meta.template) 
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
    EditorVariables = abeExtend.hooks.instance.trigger('afterVariables', EditorVariables)

    res.render(config.abeEngine, EditorVariables)
  }).catch((e) => {
    console.log('error', e)
  })
}

export default route