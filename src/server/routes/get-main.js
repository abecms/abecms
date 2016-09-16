import express from 'express'
import fs from 'fs'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import {minify} from 'html-minifier'
import extend from 'extend'
import * as abe from '../../cli'
import xss from 'xss'
import pkg from '../../../package'
import clc from 'cli-color'

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
  Handlebars,
  cleanSlug,
  Manager
} from '../../cli'

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'

var route = function(req, res, next) {
  var dateStart = new Date()

  if(req.query.filePath){
    var testXSS = xss(req.query.filePath, {
      whiteList: [],
      stripIgnoreTag: true
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
  var debugJson = (req.query.debugJson && req.query.debugJson == 'true' ) ? true : false
  var debugJsonKey = (req.query.key) ? req.query.key : false
  var debugHtml = (req.query.debugHtml && req.query.debugHtml == 'true' ) ? true : false

  var isHome = true

  let p = new Promise((resolve, reject) => {

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

      let tplUrl = FileParser.getFileDataFromUrl(filePath)

      if(!fileUtils.isFile(tplUrl.json.path)) {
        res.redirect("/abe/");
        return;
      }

      editor(templatePath, tplUrl)
        .then((result) => {
          var manager = {}

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

          resolve({
            obj: result,
            manager: manager,
            tplUrl: tplUrl
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
    let tplUrl = result.tplUrl
  
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
    var _file = (tplUrl) ? tplUrl.draft.file : false
    var _filePath = (req.query.filePath) ? req.query.filePath : false
    if (_filePath) {
      _filePath = '/' + _filePath.replace(/^\/+/, '')
    }

    var pageHtml = '' 
    if(typeof _json !== 'undefined' && _json !== null 
      && typeof _json.abe_meta !== 'undefined' && _json.abe_meta !== null) { 
      var text = getTemplate(_json.abe_meta.template) 
      var page = new Page(_json.abe_meta.template, text, _json, false) 
      pageHtml = page.html.replace(/"/g, '\"').replace(/'/g, "\'").replace(/<!--/g, '<ABE!--').replace(/-->/g, '--ABE>')
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
      log.duration('load page: ' + _filePath, ((new Date().getTime() - dateStart.getTime()) / 1000))
      res.render(config.abeEngine, EditorVariables)
    }
  }).catch((e) => {
    console.log('error', e)
  })
}

export default route