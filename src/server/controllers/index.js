import express from 'express'
import fs from 'fs'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import {minify} from 'html-minifier'
import extend from 'extend'
import * as abe from '../../cli'
import xss from 'xss'
import pkg from '../../../package'

import {
  fileAttr,
  save,
  getAttr, getEnclosingTags, escapeTextToRegex,
  Util,
  FileParser,
  fileUtils,
  folderUtils,
  config,
  cli,
  log,
  Page,
  Locales,
  abeProcess,
  getTemplate,
  Hooks,
  Plugins,
  serveSite,
  Handlebars,
  cleanSlug
} from '../../cli'

import {editor} from './editor'
import locale from '../helpers/abe-locale'

var router = express.Router()
Hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)
Hooks.instance.trigger('beforeAddRoute', router)

// Abe templating engine route
router.get('/abe/*', function(req, res, next) {
  if(req.query.filePath){
    var testXSS = xss(req.query.filePath, {
      whiteList: [],
      stripIgnoreTag: true,
      // stripIgnoreTagBody: ['script']
    })
    if(testXSS !== req.query.filePath){
      // res.status(400).send('<h1>400 Bad Request</h1>Not a valid URL format');
      res.redirect(`/abe/${req.params[0]}?filePath=${testXSS}`);
      return
    }
  }
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var templatePath = fileUtils.getTemplatePath(req.params[0])
  var filePath = fileUtils.getFilePath(req.query.filePath)

  filePath = cleanSlug(filePath)

  var obj
  var tplUrl
  var isHome = true
  var manager = {}

  var p = new Promise((resolve, reject) => {

    if(templatePath !== null && filePath !== null) {

      isHome = false

      if(!fileAttr.test(filePath)){
        var folderFilePath = filePath.split('/')
        folderFilePath.pop()
        folderFilePath = fileUtils.pathWithRoot(folderFilePath.join('/'))
        mkdirp.sync(folderFilePath)
        var files = FileParser.getFiles(folderFilePath, true, 2)
        var latest = fileAttr.filterLatestVersion(fileAttr.getFilesRevision(files, filePath), 'draft')
        if(latest.length) {
          filePath = latest[0].path
        }
      }

      tplUrl = FileParser.getFileDataFromUrl(filePath)
      var fakeContent = (req.query.fakeContent) ? true : false

      var p2 = new Promise((resolve2, reject2) => {
        if(!fileUtils.isFile(tplUrl.json.path)) {
          var json = {}
          var tpl = templatePath
          var text = getTemplate(tpl)
          text = Util.removeDataList(text)
          var resHook = Hooks.instance.trigger('beforeFirstSave', filePath, req.query, json, text)
          filePath = resHook.filePath
          json = resHook.json
          text = resHook.text
          save(filePath, req.params[0], json, text, 'draft', null, 'draft')
            .then((resSave) => {
                filePath = resSave.htmlPath
                tplUrl = FileParser.getFileDataFromUrl(filePath)
                resolve2()
              }).catch(function(e) {
                console.error(e.stack)
              })
        }else {
          resolve2()
        }
      })

      p2.then(() => {

        editor(templatePath, tplUrl, fakeContent)
          .then((res) => {
            obj = res

            FileParser.getAssetsFolder()
            FileParser.getAssets() 

            var revisionFilePath = FileParser.changePathEnv(filePath, config.draft.url)
            var dirPath = fileUtils.removeLast(revisionFilePath)
            var allDraft = FileParser.getFiles(dirPath, true, 99, new RegExp("\\." + config.files.templates.extension))

            allDraft = FileParser.getMetas(allDraft, 'draft')
            var breadcrumb = req.params[0].split('/')
            manager.file = {
              revision: fileAttr.getFilesRevision(allDraft, fileAttr.delete(revisionFilePath))
              ,template: breadcrumb
              ,path: (req.query.filePath) ? fileUtils.cleanTplName(req.query.filePath) : ''
            }
            if(manager.file.revision.length > 0){
              var publishPath = fileAttr.delete(manager.file.revision[0].path.replace(new RegExp(`/${config.draft.url}/`), `/${config.publish.url}/`))
              manager.file.isPublished = fileUtils.isFile(publishPath)
            }
            resolve()
          }).catch(function(e) {
            console.error(e.stack)
          })
        }).catch(function(e) {
          console.error(e.stack)
        })
    }else {
      resolve()
    }
  }).catch(function(e) {
    console.error(e.stack) // "oh, no!"
  })

  p.then(() => {

    manager.home = {
      files: FileParser.getAllFiles()
    }

    manager.list = FileParser.getProjetFiles()
    manager.editConfig = config.getConfigByWebsite()
    manager.config = JSON.stringify(config)
    
    var _hasBlock = (obj) ? obj.hasBlock : false
    var _hasSingleBlock = (obj) ? obj.hasSingleBlock : false
    var _template = (filePath) ? '/page/' + req.params[0] + `?filePath=${req.query.filePath}` : false
    var _form = (obj) ? obj.form : false
    var _json = (obj) ? obj.json : false
    var _file = (tplUrl) ? tplUrl.draft.file : false
    var _filePath = (req.query.filePath) ? req.query.filePath : false

    var EditorVariables = {
      abeUrl: '/abe/',
      test: JSON.stringify(locale),
      text: locale,
      templatePath: req.params[0],
      template: _template,
      hasSingleBlock: _hasSingleBlock,
      hasBlock: _hasBlock,
      form: _form,
      urlToSaveFile: _filePath,
      tplName: _file,
      json: _json,
      config: config,
      Locales: Locales.instance.i18n,
      manager: manager,
      express: {
        res: res,
        req: req
      },
      abeVersion: pkg.version,
      nonce: "'nonce-" + res.locals.nonce + "'"
    }
    var EditorVariables = Hooks.instance.trigger('afterVariables', EditorVariables)

    res.render(config.abeEngine, EditorVariables)
  })
})

function page(req, res, next) {
  var templatePath = fileUtils.getTemplatePath(req.params[0])
  var filePath = cleanSlug(req.query.filePath)
  filePath = fileUtils.getFilePath(filePath)
  var html = (req.query.html) ? true : false
  var json = null
  if(typeof req.body.json !== 'undefined' && req.body.json !== null) {
    if(typeof req.body.json === 'string') {
      json = JSON.parse(req.body.json)
    }else {
      json = req.body.json
    }
  }

  if(typeof filePath !== 'undefined' && filePath !== null) {

    if(!fileAttr.test(filePath)) {
      var folderFilePath = filePath.split('/')
      folderFilePath.pop()
      folderFilePath = fileUtils.pathWithRoot(folderFilePath.join('/'))
      mkdirp.sync(folderFilePath)
      var files = FileParser.getFiles(folderFilePath, true, 2)
      var latest = fileAttr.filterLatestVersion(fileAttr.getFilesRevision(files, filePath), 'draft')
      if(latest.length) {
        filePath = latest[0].path
      }
    }

    var tplUrl = FileParser.getFileDataFromUrl(filePath)
    
    if(typeof json === 'undefined' || json === null) {
      json = FileParser.getJson(tplUrl.json.path)
    }
    
    let meta = config.meta.name
    let extension = config.files.templates.extension

    var template = ''
    if(typeof json[meta] !== 'undefined' && json[meta] !== null && json[meta] !== ''
      && json[meta].template !== 'undefined' && json[meta].template !== null && json[meta].template !== '') {
      template = json[meta].template
    }else {
      template = fileUtils.getTemplatePath(req.params[0])
    }
    var text = getTemplate(template)

    Util.getDataList(fileUtils.removeLast(tplUrl.publish.link), text, json)
      .then(() => {
        var page = new Page(templatePath, text, json, html)
        res.set('Content-Type', 'text/html')
        res.send(page.html)
      }).catch(function(e) {
        console.error(e.stack)
      })
  }else {
    // not 404 page if tag abe image upload into each block
    if(/upload%20image/g.test(req.url)) {
      var b64str = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      var img = new Buffer(b64str, 'base64');

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': img.length
      });
      res.end(img); 
    }else {
      res.status(404).send('Not found');
    }
  }
}

// Template page route
router.post('/page/*', function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  page(req, res, next)
})

// Template page route
router.get('/page/*', function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  page(req, res, next)
})

router.get('/publish-all/*', function(req, res, next){
  abeProcess('publish-all', [`FILEPATH=${req.query.filePath}`])
  res.send('ok')
})

router.post('/publish', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = cleanSlug(req.body.filePath)
  var p = new Promise((resolve, reject) => {
    save(
      fileUtils.getFilePath(filePath),
      req.body.tplPath,
      req.body.json,
      '',
      'draft',
      null,
      'publish')
      .then(() => {
        resolve()
      }).catch(function(e) {
        console.error(e.stack)
      })
  })

  p.then((resSave) => {
    save(
      fileUtils.getFilePath(req.body.filePath),
      req.body.tplPath,
      req.body.json,
      '',
      'publish',
      resSave,
      'publish')
      .then((resSave) => {
        if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
          res.set('Content-Type', 'application/json')
          res.send(JSON.stringify({error: resSave.error}))
        }
        var result
        if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
          result = resSave
        }
        if(typeof resSave.json !== 'undefined' && resSave.json !== null){
          result = {
            success: 1,
            json: resSave.json
          }
        }
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(result))
      })
  }).catch(function(e) {
    console.error(e.stack)
  })
})

router.post('/reject', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var p = new Promise((resolve, reject) => {
    save(
      fileUtils.getFilePath(req.body.filePath),
      req.body.tplPath,
      req.body.json,
      '',
      'draft',
      null,
      'reject')
      .then(() => {
        resolve()
      }).catch(function(e) {
        console.error(e.stack)
      })
  })

  p.then((resSave) => {
    save(
      fileUtils.getFilePath(req.body.filePath),
      req.body.tplPath,
      req.body.json,
      '',
      'reject',
      resSave,
      'reject')
      .then((resSave) => {
        if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
          res.set('Content-Type', 'application/json')
          res.send(JSON.stringify({error: resSave.error}))
        }
        var result
        if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
          result = resSave
        }
        if(typeof resSave.json !== 'undefined' && resSave.json !== null){
          result = {
            success: 1,
            json: resSave.json
          }
        }
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(result))
      })
  }).catch(function(e) {
    console.error(e.stack)
  })
})

router.post('/draft', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  save(
    fileUtils.getFilePath(req.body.filePath),
    req.body.tplPath,
    req.body.json,
    '',
    'draft',
    null,
    'draft')
    .then((resSave) => {
      if(typeof resSave.error !== 'undefined' && resSave.error !== null  ){
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify({error: resSave.error}))
      }
      var result
      if(typeof resSave.reject !== 'undefined' && resSave.reject !== null){
        result = resSave
      }
      if(typeof resSave.json !== 'undefined' && resSave.json !== null){
        result = {
          success: 1,
          json: resSave.json
        }
      }
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify(result))
    })
})

router.get('/logs*', function(req, res, next){
  var file = fileUtils.concatPath(config.root, 'logs', `${req.params[0]}.log`)
  var html = ''
  if (fileUtils.isFile(file)) {
    var commonStyle = "font-family: arial; font-size: 12px;"
    var shellp = '<span style="color: #18FFFF;'+commonStyle+'"> > ' + req.params[0].replace(/\//g, '') + "</span>"
    var content = fse.readFileSync(file, 'utf8')
    html = '<!doctype html>' + "\n" + '<html>' + "\n" + '<head>' + "\n" + '<style>body, html {background: #212121;}</style>' + "\n" + '</head>' + "\n" + '<body>'
    html += '<a href="/logs" style="color: white;'+commonStyle+'">< Go back</a>'
    content = content.split("\n")
    Array.prototype.forEach.call(content, (item) => {
      if(typeof item !== 'undefined' && item !== null && item !== '') {
        
        var cut = item.split('---')
        var date = ''
        var text = '<span style="color: white; '+commonStyle+'>' + item + '</span>'
        if(typeof cut[0] !== 'undefined' && cut[0] !== null && typeof cut[1] !== 'undefined' && cut[1] !== null) {
          date = cut[0].replace(/([0-9]{0,2}:[0-9]{0,2}:[0-9]{0,2})/, '<strong style="color: #B2FF59;">$1</strong>')
          date = "\n" + '<span style="color: #00E676; text-transform: uppercase; font-family: arial; font-size: 11px;"> [ ' + date + ' ] </span>'
          text = "\n" + '<span style="color: white; '+commonStyle+'">' + cut[1] + '</span>'
        }
        html += "\n" + "<div>" + "\n" + date + "\n" + shellp + "\n" + text + "\n" + "</div>"
      }
    })
    html += "\n" + '</body>' + "\n" + '</html>'
  }else {
    var path = fileUtils.concatPath(config.root, 'logs')
    var files = FileParser.read(path, path, 'files', true, /\.log/, 99)
    html += '<a href="/delete-logs">Go to delete logs</a>'
    html += '<br /><br /><div>Choose to see logs files</div>'
    html += '<ul>'
    Array.prototype.forEach.call(files, (item) => {
      html += '<li>'
      html += '<a href="/logs/' + fileUtils.removeExtension(item.cleanPath) + '">' + item.name + '</a><br />'
      html += '</li>'
    })
    html += '</ul>'
  }
  res.send(html)
})

router.get('/delete-logs*', function(req, res, next){
  var file = fileUtils.concatPath(config.root, 'logs', `${req.params[0]}.log`)
  var html = ''
  if (fileUtils.isFile(file)) {
    fse.removeSync(file)
    res.redirect('/delete-logs/');
  }else {
    var path = fileUtils.concatPath(config.root, 'logs')
    var files = FileParser.read(path, path, 'files', true, /\.log/, 99)

    html += '<a href="/logs">Go to logs</a>'
    html += '<br /><br /><div>Choose to remove logs files</div>'
    html += '<ul>'
    Array.prototype.forEach.call(files, (item) => {
      html += '<li>'
      html += '<a href="/delete-logs/' + fileUtils.removeExtension(item.cleanPath) + '">' + item.name + '</a><br />'
      html += '</li>'
    })
    html += '</ul>'
  }
  res.send(html)
})

router.get('/save-config', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  config.save(req.query.website, req.query.json)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(req.query.json))
})

router.get('/unpublish', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = cleanSlug(req.body.filePath)
  var dirPath = FileParser.unpublishFile(filePath)

  var result = {
    success: 1,
    file: req.query.filePath
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
})

router.get('/delete', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = cleanSlug(req.body.filePath)
  var dirPath = FileParser.deleteFile(filePath)

  var result = {
    success: 1,
    file: req.query.filePath
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
})

router.get('/', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;


  res.redirect('/abe/');
})

router.post('/upload/*', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var resp = {success: 1}
  var filePath
  var fstream
  var folderWebPath = '/' + config.upload.image
  folderWebPath = Hooks.instance.trigger('beforeSaveImage', folderWebPath, req)
  var folderFilePath = fileUtils.concatPath(config.root, config.publish.url, folderWebPath)
  mkdirp.sync(folderFilePath)
  req.pipe(req.busboy)
  var size = 0
  var hasError = false
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var ext = filename.split('.')
    ext = ext[ext.length - 1].toLowerCase()
    file.fileRead = []

    var returnErr = function (msg) {
      file.resume()
      hasError = true
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify({error: 1, response: msg}))
    }

    file.on('limit', function() {
      req.unpipe(req.busboy)
      returnErr('file to big')
    })

    file.on('data', function(chunk) {
      file.fileRead.push(chunk)
    });

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png' && mimetype !== 'image/svg+xml') {
      returnErr('unauthorized file')
    } else if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png' && ext !== 'svg') {
      returnErr('not an image')
    }

    file.on('end', function() {
      if(hasError) return
      filePath = fileUtils.concatPath(folderFilePath, filename)
      resp['filePath'] = fileUtils.concatPath(folderWebPath, filename)
      fstream = fs.createWriteStream(filePath)
      for (var i = 0; i < file.fileRead.length; i++) {
        fstream.write(file.fileRead[i])
      }
      fstream.on('close', function () {})
    })
  })
  req.busboy.on('finish', function() {
    if(hasError) return
    resp = Hooks.instance.trigger('afterSaveImage', resp, req)
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(resp))
  });
})

var site = new serveSite()

router.get('/site*', function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  if(!site.isStarted) site.start(config)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(site.infos))
})

var routes = Plugins.instance.getRoutes()
Array.prototype.forEach.call(routes, (route) => {
  if(typeof route.get !== 'undefined' && route.get !== null) {
    Array.prototype.forEach.call(route.get, (routeGet) => {
      try {
        var pluginRoot = require(routeGet.path)
        if(typeof pluginRoot.default === 'object') {
          router.get(routeGet.routePath, pluginRoot.default)
        }else {
          router.get(routeGet.routePath, (req, res, next) => {
            pluginRoot.default(req, res, next, abe)
          })
        }
      } catch(e) {
        // statements
        console.log(e);
      }
    })
  }
  if(typeof route.post !== 'undefined' && route.post !== null) {
    Array.prototype.forEach.call(route.post, (routePost) => {
      try {
        var pluginRoot = require(routePost.path)
        if(typeof pluginRoot.default === 'object') {
          router.post(routePost.routePath, pluginRoot.default)
        }else {
          router.post(routePost.routePath, (req, res, next) => {
            pluginRoot.default(req, res, next, abe)
          })
        }
      } catch(e) {
        // statements
        console.log(e);
      }
    })
  }
})

Hooks.instance.trigger('afterAddRoute', router)

export default router
