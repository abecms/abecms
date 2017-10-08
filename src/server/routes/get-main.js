import path from 'path'
import xss from 'xss'
import pkg from '../../../package'

import {
  config,
  Page,
  cmsData,
  cmsEditor,
  cmsTemplates,
  coreUtils,
  abeExtend,
  Manager,
  User
} from '../../cli'

import locale from '../helpers/abe-locale'

function renderAbeAdmin(EditorVariables, obj, filePath) {
  var manager = {}

  manager.home = {
    files: [] //Manager.instance.getList()
  }

  manager.nbPosts = Manager.instance.getList().length
  manager.list = Manager.instance.getStructureAndTemplates()
  manager.editConfig = EditorVariables.express.req.app.get('config')
  manager.config = JSON.stringify(config)

  var _preview = filePath
    ? '/abe/page/' +
      EditorVariables.express.req.params[0] +
      `?filePath=${EditorVariables.express.req.query.filePath}`
    : false
  var _form = obj ? obj.form : false
  var _json = obj ? obj.json : false
  var _filePath = filePath ? filePath : false
  if (_filePath) {
    _filePath = '/' + _filePath.replace(/^\/+/, '')
  }

  var pageHtml = ''
  if (
    typeof _json !== 'undefined' &&
    _json !== null &&
    typeof _json.abe_meta !== 'undefined' &&
    _json.abe_meta !== null
  ) {
    var text = cmsTemplates.template.getTemplate(_json.abe_meta.template, _json)
    var page = new Page(text, _json, false)
    pageHtml = page.html
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/<!--/g, '<ABE!--')
      .replace(/-->/g, '--ABE>')
  }

  var editorWidth = '25%'
  EditorVariables.express.req.headers &&
    EditorVariables.express.req.headers.cookie &&
    EditorVariables.express.req.headers.cookie
      .split(';')
      .forEach(function(cookie) {
        var parts = cookie.match(/(.*?)=(.*)$/)
        if (
          typeof parts !== 'undefined' &&
          parts !== null &&
          parts.length > 2 &&
          parts[1] === 'editorWidth'
        )
          editorWidth = parts[2]
      })

  EditorVariables.pageHtml = pageHtml
  EditorVariables.test = JSON.stringify(locale)
  EditorVariables.text = locale
  EditorVariables.preview = _preview
  EditorVariables.form = _form
  EditorVariables.json = _json
  EditorVariables.manager = manager
  EditorVariables.editorWidth = editorWidth

  if (_json != null && _json.abe_meta) {
    EditorVariables.workflows = User.utils.getUserWorkflow(
      _json.abe_meta.status
    )
  }

  EditorVariables = abeExtend.hooks.instance.trigger(
    'afterVariables',
    EditorVariables
  )

  if (filePath != null && filePath.indexOf('.json') > -1) {
    EditorVariables.express.res.set('Content-Type', 'application/json')
    EditorVariables.express.res.send(JSON.stringify(_json))
  } else if (EditorVariables.pageHtml != '') {
    EditorVariables.express.res.render(config.abeEngine, EditorVariables)
  } else {
    EditorVariables.express.res.render(
      '../views/template-manager',
      EditorVariables
    )
  }
}

/**
 * This route returns the editor page as HTML
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var route = function(req, res, next) {
  var filePath = req.originalUrl.replace('/abe/editor', '')
  if (filePath === '' || filePath === '/') {
    filePath = null
  }
  if (
    filePath != null &&
    path.extname(filePath) != `.${config.files.templates.extension}` &&
    path.extname(filePath) != '.json'
  ) {
    next()
    return
  }
  if (filePath != null) {
    var testXSS = xss(filePath, {
      whiteList: [],
      stripIgnoreTag: true
    })
    if (testXSS !== filePath) {
      filePath = testXSS
    }
  }

  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if (typeof res._header !== 'undefined' && res._header !== null) return

  var isHome = true
  var jsonPath = null
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
    abeUrl: '/abe/editor/',
    isHome: isHome,
    config: config,
    Locales: coreUtils.locales.instance.i18n,
    abeVersion: pkg.version
  }

  let p = new Promise(resolve => {
    if (filePath != null) {
      fileName = path.basename(filePath)
      folderPath = path.dirname(filePath)

      EditorVariables.isHome = false
      EditorVariables.isEditor = true
      var filePathTest = cmsData.revision.getDocumentRevision(filePath)
      if (typeof filePathTest !== 'undefined' && filePathTest !== null) {
        jsonPath = filePathTest.path
        template = filePathTest.abe_meta.template
      }

      if (jsonPath === null || !coreUtils.file.exist(jsonPath)) {
        res.redirect('/abe/editor')
        return
      }

      var json = {}
      if (coreUtils.file.exist(jsonPath)) {
        json = cmsData.file.get(jsonPath, 'utf8')
      }
      var text = cmsTemplates.template.getTemplate(template, json)
      cmsEditor.editor
        .create(text, json)
        .then(result => {
          resolve(result)
        })
        .catch(function(e) {
          console.error(e)
        })
    } else {
      resolve({
        json: {},
        manager: {}
      })
    }
  }).catch(function(e) {
    console.error(e) // "oh, no!"
  })

  p
    .then(obj => {
      var precontribs = Manager.instance.getPrecontribution()
      var promises = []
      EditorVariables.resultPrecontrib = []
      if (precontribs != null) {
        Array.prototype.forEach.call(precontribs, precontrib => {
          var p = cmsEditor.editor
            .create(precontrib, obj.json, true)
            .then(resultPrecontrib => {
              EditorVariables.resultPrecontrib.push(resultPrecontrib)
            })
            .catch(function(e) {
              console.error(e)
            })
          promises.push(p)
        })
        Promise.all(promises)
          .then(() => {
            renderAbeAdmin(EditorVariables, obj, filePath, isHome, template)
          })
          .catch(function(e) {
            console.error('get-main.js getDataList', e.stack)
          })
      }
    })
    .catch(e => {
      console.log('error', e)
    })
}

export default route
