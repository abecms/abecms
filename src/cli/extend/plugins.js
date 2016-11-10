import {spawn} from 'child_process'
import {Promise} from 'bluebird'
import path from 'path'
import fse from 'fs-extra'
import clc from 'cli-color'
import mkdirp from 'mkdirp'
import git from 'git-exec'
import which from 'which'
const npm = which.sync('npm')

import {
  coreUtils,
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
        
        this._plugins = coreUtils.file.getFoldersSync(pluginsDir, false)
        Array.prototype.forEach.call(this._plugins, (plugin) => {
          var name = plugin.path.replace(pluginsDir + '/', '')
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
              let processFiles = coreUtils.file.getFilesSync(plugProcess, false)
              Array.prototype.forEach.call(processFiles, (processFile) => {
                plugin.process[path.basename(processFile, '.js')] = processFile
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
                  let routesGet = []
                  let routePaths = coreUtils.file.getFilesSync(gets, false)
                  Array.prototype.forEach.call(routePaths, (route) => {
                    let pathUrl = `/abe/plugin/${name}/${path.basename(route, '.js')}*`
                    let routeObject = {'path':route, 'routePath':pathUrl}
                    routesGet.push(routeObject)
                  })
                  plugin.routes.get = routesGet
                }
              }catch(e) {
                plugin.routes.get = null
              }
              try {
                let posts = path.join(plugRoutes, 'post')
                let directoryPosts = fse.lstatSync(gets)
                if (directoryPosts.isDirectory()) {
                  let routesPost = []
                  let routePaths = coreUtils.file.getFilesSync(posts, false)
                  Array.prototype.forEach.call(routePaths, (route) => {
                    let pathUrl = `/abe/plugin/${name}/${path.basename(route, '.js')}*`
                    let routeObject = {'path':route, 'routePath' : pathUrl}
                    routesPost.push(routeObject)
                  })
                  plugin.routes.post = routesPost
                }
              }catch(e) {
                plugin.routes.post = null
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

  add(dir, plugin) {
    var p = new Promise((resolve) => {
        
      var pluginName = plugin.split('/')
      pluginName = pluginName[pluginName.length - 1].split('.')[0]
      var pluginDir = path.join(dir, 'plugins', pluginName)

      try{
        fse.statSync(pluginDir)
        console.log(clc.green('remove plugin'), pluginName)
        fse.removeSync(pluginDir)
      }
      catch(e){
      }
      console.log(clc.green('mkdir'), clc.green(pluginDir))
      mkdirp(pluginDir)

      git.clone(plugin, pluginDir, function(repo) {
        if (repo !== null) {
          try {
            console.log(clc.green('cd'), clc.green(pluginDir))
            process.chdir(pluginDir)

            console.log(clc.green('spawn'), clc.cyan('npm install'))
            // const npmInstall = spawn('npm', ['install', pluginDir]);
            const npmInstall = spawn(npm, ['install'])

            npmInstall.stdout.on('data', (data) => {
              var str = data.toString(), lines = str.split(/(\r?\n)/g)
              for (var i=0; i<lines.length; i++) {
                console.log(str)
              }
            })

            npmInstall.stderr.on('data', (data) => {
              var str = data.toString(), lines = str.split(/(\r?\n)/g)
              for (var i=0; i<lines.length; i++) {
                console.log(str)
              }
            })

            npmInstall.on('close', (code) => {
              console.log(clc.cyan('child process exited with code'), code)

              var json = {}
              var abeJson = dir + '/abe.json'

              try {
                var stat = fse.statSync(abeJson)
                if (stat) {
                  json = fse.readJsonSync(abeJson)
                }
              }catch(e) {
                console.log(e)
                console.log(clc.cyan('no abe.json creating'), abeJson)
              }

              if(typeof json.dependencies === 'undefined' || json.dependencies === null) {
                json.dependencies = [plugin]
              }else {
                var found = false
                Array.prototype.forEach.call(json.dependencies, (plugged) => {
                  if (plugin === plugged) {
                    found = true
                  }
                })
                if (!found) {
                  json.dependencies.push(plugin)
                }
              }

              fse.writeJsonSync(abeJson, json, { space: 2, encoding: 'utf-8' })
              resolve()
            })

            npmInstall.on('error', (err) => {
              console.log(clc.red('cannot install npm dependencies for'), pluginDir)
              console.log(err)
              resolve(err)
            })
          } catch (err) {
            console.log(clc.cyan('chdir'), err)
            resolve(err)
          }
        } else {
          console.log(clc.red('clone error'))
          resolve(err)
        }
      })
    })

    return p
  }
}

export default Plugins