import express from 'express'
import * as abe from '../../cli'
import {
  getCreate
  ,getDuplicate
  ,getUpdate
  ,getListUrl
  ,getListHooks
  ,getMain
  ,getPage
  ,postPage
  ,postPublish
  ,getRepublish
  ,postReject
  ,postDraft
  ,getSaveConfig
  ,getUnpublish
  ,getDelete
  ,postUpload
  ,postSqlRequest
} from '../routes'

import {
  abeExtend,
  Handlebars,
} from '../../cli'

var router = express.Router()
abeExtend.hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)
abeExtend.hooks.instance.trigger('beforeAddRoute', router)

router.get('/abe/create*', getCreate)
router.get('/abe/duplicate*', getDuplicate)
router.get('/abe/update*', getUpdate)
router.post('/abe/sql-request*', postSqlRequest)
router.post('/abe/page/*', postPage)
router.get('/abe/page/*', getPage)
router.post('/abe/publish', postPublish)
router.get('/abe/republish', getRepublish)
router.post('/abe/reject', postReject)
router.post('/abe/draft', postDraft)
router.get('/abe/save-config', getSaveConfig)
router.get('/abe/unpublish*', getUnpublish)
router.get('/abe/delete*', getDelete)
router.post('/abe/upload/*', postUpload)
router.get('/abe/list-url*', function (req, res, next) {
  getListUrl(router, req, res, next) 
})
router.get('/abe/list-hooks*', getListHooks)

var routes = abeExtend.plugins.instance.getRoutes()
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
        console.log(e)
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
        console.log(e)
      }
    })
  }
})
router.get('/abe*', getMain)
// router.get('/abe*', getMain)

abeExtend.hooks.instance.trigger('afterAddRoute', router)

export default router
