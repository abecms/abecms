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
  cleanSlug
} from '../../cli'

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'

var route = function(req, res, next) {
  // TODO : AOP - responsability of Logging middleware
  var dateStart = new Date()

  // sanitize filePath
  // TODO : AOP - Responsability of Security middleware
  req.query.filePath = xss(req.query.filePath, {
    whiteList: [],
    stripIgnoreTag: true
  })

  // TODO : AOP - Responsability of Hooks middleware
  Hooks.instance.trigger('beforeRoute', req, res, next)

  if(typeof res._header !== 'undefined' && res._header !== null) return;

  // TODO : refactor getTemplatePath && getFilePath into one
  // TODO : Why using the saved template as filePath ? why not use only the json ?
  // It would simplify the code
  var templatePath = fileUtils.getTemplatePath(req.params[0])
  var filePath = fileUtils.getFilePath(req.query.filePath)

  // TODO : refactor debug layer
  var debugJson = (req.query.debugJson && req.query.debugJson == 'true' ) ? true : false
  var debugJsonKey = (req.query.key) ? req.query.key : false
  var debugHtml = (req.query.debugHtml && req.query.debugHtml == 'true' ) ? true : false

  var isHome = true

  if(templatePath !== null && filePath !== null) {

    isHome = false

    if(!fileAttr.isVersion(filePath)){
      filePath = fileAttr.getLastVersion(filePath)
    }

    console.log(filePath)
    var tplUrl = FileParser.getFileDataFromUrl(filePath)
    console.log(tplUrl)

    // TODO : Remove
    var fakeContent = (req.query.fakeContent) ? true : false

    // TODO : Remove - How is it possible that there's no json.path
    // if(!fileUtils.isFile(tplUrl.json.path)) {
    //   res.redirect("/abe/");
    //   return;
    // }
  }

  let p = new Promise((resolve, reject) => {

    if(templatePath !== null && filePath !== null) {

      editor(templatePath, tplUrl, fakeContent)
        .then((result) => {

          var manager = {}

          // TODO : Analyze
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
      files: FileParser.getAllFiles()
    }

    manager.list = FileParser.getProjectFiles()
    manager.editConfig = config.getConfigByWebsite()
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

    var EditorVariables = {
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