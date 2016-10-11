import path from 'path'
import fse from 'fs-extra'

import {
  cmsData,
  config
} from '../'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Plugins {

  constructor(enforcer) {
    if(enforcer != singletonEnforcer) throw 'Cannot construct Plugins singleton'
    this._plugins = []
    this.fn = []
    var pluginsDir = path.join(config.root, config.plugins.url)
    try {
      var directoryPlugins = fse.lstatSync(pluginsDir)
      if (directoryPlugins.isDirectory()) {
        
        this._plugins = cmsData.file.getFolders(pluginsDir, true, 0)
        Array.prototype.forEach.call(this._plugins, (plugin) => {
          // has hooks
          var plugHooks = path.join(plugin.path, config.hooks.url)
          try {
            var directoryHook = fse.lstatSync(plugHooks)
            if (directoryHook.isDirectory()) {
              var plugHooksFile = path.join(plugHooks, 'hooks.js')
              var h = require(plugHooksFile)
              plugin.hooks = h.default
            }else {
              plugin.hooks = null
            }
          }catch(e) {
            plugin.hooks = null
          }

          // has partials
          var plugPartials = path.join(plugin.path, config.pluginsPartials)
          try {
            var directoryPartials = fse.lstatSync(plugPartials)
            if (directoryPartials.isDirectory()) {
              plugin.partials = plugPartials
            }else {
              plugin.partials = null
            }
          }catch(e) {
            plugin.partials = null
          }

          // has templates
          var plugTemplates = path.join(plugin.path, config.templates.url)
          try {
            var directoryTemplates = fse.lstatSync(plugTemplates)
            if (directoryTemplates.isDirectory()) {
              plugin.templates = plugTemplates
            }else {
              plugin.templates = null
            }
          }catch(e) {
            plugin.templates = null
          }

          // has process
          var plugProcess = path.join(plugin.path, 'process')
          try {
            var directoryProcess = fse.lstatSync(plugProcess)
            if (directoryProcess.isDirectory()) {
              plugin.process = {}
              var processFiles = cmsData.file.getFiles(plugProcess, true, 0)
              Array.prototype.forEach.call(processFiles, (processFile) => {
                plugin.process[processFile.cleanNameNoExt] = processFile.path
              })
            }else {
              plugin.process = null
            }
          }catch(e) {
            plugin.process = null
          }

          // has routes
          var plugRoutes = path.join(plugin.path, 'routes')
          try {
            var directoryRoute = fse.lstatSync(plugRoutes)
            if (directoryRoute.isDirectory()) {
              plugin.routes = {}

              var gets = path.join(plugRoutes, 'get')
              try {
                var directoryGets = fse.lstatSync(gets)
                if (directoryGets.isDirectory()) {
                  var routesGet = cmsData.file.getFiles(gets, true, 0)
                  Array.prototype.forEach.call(routesGet, (route) => {
                    route.routePath = `/abe/plugin/${plugin.name}/${route.name.replace('.js', '')}*`
                  })
                  plugin.routes.get = routesGet
                }
              }catch(e) {

              }
              try {
                var posts = path.join(plugRoutes, 'post')
                var directoryPosts = fse.lstatSync(gets)
                if (directoryPosts.isDirectory()) {
                  var routesPost = cmsData.file.getFiles(posts, true, 0)
                  Array.prototype.forEach.call(routesPost, (route) => {
                    route.routePath = `/abe/plugin/${plugin.name}/${route.name.replace('.js', '')}*`
                  })
                  plugin.routes.post = routesPost
                }
              }catch(e) {

              }
            }else {
              plugin.routes = null
            }
          }catch(e) {
            plugin.routes = null
          }
        })
      
      }
    } catch (e) {
      
    }
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Plugins(singletonEnforcer)
    }
    return this[singleton]
  }

  getProcess(fn) {
    var proc = null
    if(typeof this._plugins !== 'undefined' && this._plugins !== null) {
      Array.prototype.forEach.call(this._plugins, (plugin) => {
        if(typeof plugin.process !== 'undefined' && plugin.process !== null
          && typeof plugin.process[fn] !== 'undefined' && plugin.process[fn] !== null) {
          proc = plugin.process[fn]
        }
      })
    }

    return proc
  }

  hooks() {
    if(arguments.length > 0) {
      var args = [].slice.call(arguments)
      var fn = args.shift()

      if(this._plugins != null) {
        Array.prototype.forEach.call(this._plugins, (plugin) => {
          if(plugin.hooks != null&& plugin.hooks[fn] != null) {
            args[0] = plugin.hooks[fn].apply(this, args)
          }
        })
      }
    } else {
      args = ['']
    }

    return args[0]
  }

  getHooks() {
    return this._plugins
  }

  getPartials() {
    var partials = []
    Array.prototype.forEach.call(this._plugins, (plugin) => {
      if(typeof plugin.partials !== 'undefined' && plugin.partials !== null) {
        partials.push(plugin.partials)
      }
    })

    return partials
  }

  getRoutes() {
    var routes = []
    Array.prototype.forEach.call(this._plugins, (plugin) => {
      if(typeof plugin.routes !== 'undefined' && plugin.routes !== null) {
        routes = routes.concat(plugin.routes)
      }
    })

    return routes
  }
}

export default Plugins