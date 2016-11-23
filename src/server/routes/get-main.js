import path from 'path'
import xss from 'xss'
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

function renderAbeAdmin(EditorVariables, obj, filePath) {
  var manager = {}
  
  manager.home = {
    files: Manager.instance.getList()
  }

  manager.list = Manager.instance.getStructureAndTemplates()
  manager.editConfig = EditorVariables.express.req.app.get('config')
  manager.config = JSON.stringify(config)
    
  var _hasBlock = (obj) ? obj.hasBlock : false
  var _hasSingleBlock = (obj) ? obj.hasSingleBlock : false
  var _preview = (filePath) ? '/abe/page/' + EditorVariables.express.req.params[0] + `?filePath=${EditorVariables.express.req.query.filePath}` : false
  var _form = (obj) ? obj.form : false
  var _json = (obj) ? obj.json : false
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
    
  var editorWidth = '33%'
  EditorVariables.express.req.headers && EditorVariables.express.req.headers.cookie && EditorVariables.express.req.headers.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    if(parts[1] === 'editorWidth') editorWidth = parts[2]
  })

  EditorVariables.pageHtml = pageHtml
  EditorVariables.test = JSON.stringify(locale)
  EditorVariables.text = locale
  EditorVariables.preview = _preview
  EditorVariables.hasSingleBlock = _hasSingleBlock
  EditorVariables.hasBlock = _hasBlock
  EditorVariables.form = _form
  EditorVariables.json = _json
  EditorVariables.manager = manager
  EditorVariables.nonce = '\'nonce-' + EditorVariables.express.res.locals.nonce + '\''
  EditorVariables.editorWidth = editorWidth

  EditorVariables = abeExtend.hooks.instance.trigger('afterVariables', EditorVariables)

  if (filePath != null && filePath.indexOf('.json') > -1) {
    EditorVariables.express.res.set('Content-Type', 'application/json')
    EditorVariables.express.res.send(JSON.stringify(_json))
  }else {
    EditorVariables.express.res.render(config.abeEngine, EditorVariables)
  }
}

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
  var template = null
  var fileName = null
  var folderPath = null

  var EditorVariables = {
    user: res.user,
    slugs: Manager.instance.getSlugs(),
    express: {
      res: res,
      req: req
    },
    filename: fileName,
    folderPath: folderPath,
    abeUrl: '/abe/',
    isHome: isHome,
    config: config,
    Locales: coreUtils.locales.instance.i18n,
    abeVersion: pkg.version
  }

  let p = new Promise((resolve) => {

    if(filePath != null) {
      fileName = path.basename(filePath)
      folderPath = path.dirname(filePath)

      EditorVariables.isHome = false
      var filePathTest = cmsData.revision.getDocumentRevision(filePath)
      if(typeof filePathTest !== 'undefined' && filePathTest !== null) {
        jsonPath = filePathTest.path
        linkPath = filePathTest.abe_meta.link
        template = filePathTest.abe_meta.template
      }

      if(jsonPath === null || !coreUtils.file.exist(jsonPath)) { 
        res.redirect('/abe/') 
        return 
      }

      var json = {}
      if(coreUtils.file.exist(jsonPath)) {
        json = cmsData.file.get(jsonPath, 'utf8')
      }
      var text = cmsTemplates.template.getTemplate(template)

      editor(text, json, linkPath)
        .then((result) => {
          resolve(result)
        }).catch(function(e) {
          console.error(e)
        })
    }else {
      resolve({
        json: {},
        manager: {}
      })
    }
  }).catch(function(e) {
    console.error(e) // "oh, no!"
  })

  p.then((obj) => {
    var precontrib = Manager.instance.getPrecontribution()
    editor(precontrib.template, obj.json, '', true)
      .then((resultPrecontrib) => {
        EditorVariables.resultPrecontrib = resultPrecontrib
        renderAbeAdmin(EditorVariables, obj, filePath, isHome, template)
      }).catch(function(e) {
        console.error(e)
      })
  }).catch((e) => {
    console.log('error', e)
  })
}

export default route