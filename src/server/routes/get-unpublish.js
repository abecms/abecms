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
  var dirPath = FileParser.unpublishFile(filePath)

  var result = {
    success: 1,
    file: req.query.filePath
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route