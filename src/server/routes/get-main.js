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

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'

var route = function(req, res, next) {
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
  }).catch((e) => {
    console.log('error', e)
  })
}

export default route