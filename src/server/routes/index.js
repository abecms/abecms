import getMain from './get-main'
import postListUrlSave from './post-list-url-save'
import getListUrl from './get-list-url'
import getListWorkflow from './get-list-workflow'
import getListHooks from './get-list-hooks'
import getPage from './get-page'
import postPage from './post-page'
import getGeneratePost from './get-generate-posts'
import getSaveConfig from './get-save-config'
import postUpload from './post-upload'
import postSqlRequest from './post-sql-request'
import postReference from './post-reference'
import getReference from './get-reference'
import postStructure from './post-structure'
import getStructure from './get-structure'
import getPaginate from './get-paginate'
import getThumbs from './get-thumbs'
import getImage from './get-image'
import getHome from './get-home'
import getThemes from './get-themes'
import postThemes from './post-themes'
import * as users from './users'
import * as operations from './operations'
import * as rest from './rest'

import express from 'express'
import * as abe from '../../cli'

import {abeExtend, Handlebars, config} from '../../cli'

var router = express.Router()
abeExtend.hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)
abeExtend.hooks.instance.trigger('beforeAddRoute', router)

router.get('/abe/rest/posts*', rest.posts)
router.get('/abe/rest/post*', rest.post)
router.get('/abe/rest/activity-stream', rest.activityStream)
router.post('/abe/rest/authenticate', rest.authenticate)

router.get('/abe/users/forgot', users.getForgot)
router.get('/abe/users/list', users.getList)
router.get('/abe/users/login', users.getLogin)
router.get('/abe/users/logout', users.getLogout)
router.get('/abe/users/reset', users.getReset)
router.get('/abe/users/profile', users.getProfile)
router.post('/abe/users/activate', users.postActivate)
router.post('/abe/users/add', users.postAdd)
router.post('/abe/users/deactivate', users.postDeactivate)
router.post('/abe/users/login', users.postLogin)
router.post('/abe/users/remove', users.postRemove)
router.post('/abe/users/reset', users.postReset)
router.post('/abe/users/update', users.postUpdate)
router.post('/abe/users/profile', users.postProfile)

router.get('/abe/paginate', getPaginate)
router.post('/abe/sql-request*', postSqlRequest)
router.post('/abe/page/*', postPage)
router.get('/abe/page/*', getPage)
router.get('/abe/generate-posts', getGeneratePost)
router.get('/abe/save-config', getSaveConfig)
router.get('/abe/reference', getReference)
router.get('/abe/structure', getStructure)
router.get('/abe/thumbs/*', getThumbs)
router.get('/abe/image/*', getImage)
router.post('/abe/upload/*', postUpload)
router.post('/abe/reference/*', postReference)
router.post('/abe/structure/*', postStructure)
router.get('/abe/editor*', getMain)
router.post('/abe/list-url/save*', postListUrlSave)
router.get('/abe/themes', getThemes)
router.post('/abe/themes', postThemes)

router.get('/abe/list-workflow*', function(req, res, next) {
  getListWorkflow(router, req, res, next)
})
router.get('/abe/list-url*', function(req, res, next) {
  getListUrl(router, req, res, next)
})
router.get('/abe/list-hooks*', getListHooks)

/**
 * Operations
 * - create : create a post
 * - update : update a post, changing its name (or path or template)
 * - delete : delete a post
 * - duplicate : duplicate a revision
 * - reject : reject a workflow step (else but the publish)
 * - unpublish : unpublish a published post (=== reject a published post)
 * - submit : submit a workflow step (including draft and publish)
 * - edit : save a post keeping it in its status
 */

router.post('/abe/operations/create*', operations.postCreate)
router.post('/abe/operations/duplicate*', operations.postDuplicate)
router.post('/abe/operations/update*', operations.postUpdate)

var workflows = config.users.workflow
Array.prototype.forEach.call(workflows, workflow => {
  router.get(`/abe/operations/delete/${workflow}*`, operations.getDelete)

  if (workflow != 'draft' && workflow != 'publish') {
    router.post(`/abe/operations/reject/${workflow}*`, operations.postReject)
  } else if (workflow == 'publish') {
    router.get('/abe/operations/unpublish*', operations.getUnpublish)
  }

  router.post(`/abe/operations/submit/${workflow}*`, operations.postSubmit)
  router.post(`/abe/operations/edit/${workflow}*`, operations.postEdit)
})

var routes = abeExtend.plugins.instance.getRoutes()
Array.prototype.forEach.call(routes, route => {
  if (typeof route.get !== 'undefined' && route.get !== null) {
    Array.prototype.forEach.call(route.get, routeGet => {
      try {
        var pluginRoot = require(routeGet.path)
        if (typeof pluginRoot.default === 'object') {
          if (typeof pluginRoot.middleware === 'function') {
            router.get(
              routeGet.routePath,
              pluginRoot.middleware,
              pluginRoot.default
            )
          } else {
            router.get(routeGet.routePath, pluginRoot.default)
          }
        } else {
          if (typeof pluginRoot.middleware === 'function') {
            router.get(
              routeGet.routePath,
              pluginRoot.middleware,
              (req, res, next) => {
                pluginRoot.default(req, res, next, abe)
              }
            )
          } else {
            router.get(routeGet.routePath, (req, res, next) => {
              pluginRoot.default(req, res, next, abe)
            })
          }
        }
      } catch (e) {
        // statements
        console.log(e)
      }
    })
  }
  if (typeof route.post !== 'undefined' && route.post !== null) {
    Array.prototype.forEach.call(route.post, routePost => {
      //console.log(routePost.path)
      try {
        var pluginRoot = require(routePost.path)
        if (typeof pluginRoot.default === 'object') {
          if (typeof pluginRoot.middleware === 'function') {
            router.post(
              routePost.routePath,
              pluginRoot.middleware,
              pluginRoot.default
            )
          } else {
            router.post(routePost.routePath, pluginRoot.default)
          }
        } else {
          if (typeof pluginRoot.middleware === 'function') {
            router.post(
              routePost.routePath,
              pluginRoot.middleware,
              (req, res, next) => {
                pluginRoot.default(req, res, next, abe)
              }
            )
          } else {
            router.post(routePost.routePath, (req, res, next) => {
              pluginRoot.default(req, res, next, abe)
            })
          }
        }
      } catch (e) {
        // statements
        console.log(e)
      }
    })
  }
})

router.get('/abe*', getHome)

abeExtend.hooks.instance.trigger('afterAddRoute', router)

export default router
