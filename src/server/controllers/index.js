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
  getLogs
  ,getDeleteLogs
  ,getMain
  ,getPage
  ,postPage
  ,postPublish
  ,postReject
  ,postDraft
  ,getSaveConfig
  ,getUnpublish
  ,getDelete
  ,postUpload
  ,getSite
} from '../routes'

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

import locale from '../helpers/abe-locale'
import pageHelper from '../helpers/page'

var router = express.Router()
Hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)
Hooks.instance.trigger('beforeAddRoute', router)

router.get('/abe/logs*', getLogs)
router.get('/abe/delete-logs*', getDeleteLogs)
router.get('/abe*', getMain)
router.post('/page/*', postPage)
router.get('/page/*', getPage)
router.post('/publish', postPublish)
router.post('/reject', postReject)
router.post('/draft', postDraft)
router.get('/save-config', getSaveConfig)
router.get('/unpublish', getUnpublish)
router.get('/delete', getDelete)
router.post('/upload/*', postUpload)

router.get('/', function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  res.redirect('/abe/');
})

router.get('/site*', getSite)

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
