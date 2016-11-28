import express from 'express'
import * as abe from '../../cli'
import {
  postCreate
  ,postDuplicate
  ,postUpdate
  ,getListUrl
  ,postListUrlSave
  ,getListHooks
  ,getMain
  ,getPage
  ,postPage
  ,getGeneratePost
  ,operations
  ,getSaveConfig
  ,getUnpublish
  ,getDelete
  ,postUpload
  ,postSqlRequest
  ,postReference
  ,getReference
  ,getPaginate
  ,getThumbs
  ,getImage
  ,users
} from '../routes'

import {
  abeExtend,
  Handlebars,
  config
} from '../../cli'

var router = express.Router()
abeExtend.hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)
abeExtend.hooks.instance.trigger('beforeAddRoute', router)

router.get('/abe/users/forgot', users.getForgot)
router.get('/abe/users/list', users.getList)
router.get('/abe/users/login', users.getLogin)
router.get('/abe/users/logout', users.getLogout)
router.get('/abe/users/reset', users.getReset)
router.post('/abe/users/activate', users.postActivate)
router.post('/abe/users/add', users.postAdd)
router.post('/abe/users/deactivate', users.postDeactivate)
router.post('/abe/users/login', users.postLogin)
router.post('/abe/users/remove', users.postRemove)
router.post('/abe/users/reset', users.postReset)
router.post('/abe/users/update', users.postUpdate)

router.get('/abe/paginate', getPaginate)
router.post('/abe/create*', postCreate)
router.post('/abe/duplicate*', postDuplicate)
router.post('/abe/update*', postUpdate)
router.post('/abe/sql-request*', postSqlRequest)
router.post('/abe/page/*', postPage)
router.get('/abe/page/*', getPage)
router.get('/abe/generate-posts', getGeneratePost)
router.get('/abe/save-config', getSaveConfig)
router.get('/abe/unpublish*', getUnpublish)
router.get('/abe/delete*', getDelete)
router.get('/abe/reference/*', getReference)
router.get('/abe/thumbs/*', getThumbs)
router.get('/abe/image/*', getImage)
router.post('/abe/upload/*', postUpload)
router.post('/abe/reference/*', postReference)
router.get('/abe/editor*', getMain)
router.post('/abe/list-url/save*', postListUrlSave)

router.get('/abe/list-url*', function (req, res, next) {
  getListUrl(router, req, res, next) 
})
router.get('/abe/list-hooks*', getListHooks)

var workflows = config.users.workflow
Array.prototype.forEach.call(workflows, (workflow) => {
  router.post(`/abe/save/${workflow}/reject*`, operations.postReject)
  router.post(`/abe/save/${workflow}/submit*`, operations.postSubmit)
  router.post(`/abe/save/${workflow}/edit*`, operations.postSubmit)
})

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
// router.get('/abe*', getMain)

abeExtend.hooks.instance.trigger('afterAddRoute', router)

export default router
