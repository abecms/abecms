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
import pageHelper from '../helpers/page'

var route = function(req, res, next){
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
}

export default route