import {spawn} from 'child_process'
import {Promise} from 'bluebird'
import path from 'path'
import fse from 'fs-extra'
import clc from 'cli-color'
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
    this.pluginsDir = path.join(config.root, 'node_modules') + path.sep
    this.scriptsDir = path.join(config.root, 'scripts') + path.sep
    this._plugins = []
    this.fn = []
    
    // Plugins
    if(config.plugins && Array.isArray(config.plugins)){
      Array.prototype.forEach.call(config.plugins, (pluginEntry) => {
        const plugin = this.getPluginConfig(this.pluginsDir, pluginEntry)
        this._plugins.push(plugin)
      })
    }

    // Scripts
    try {
      var directoryScripts = fse.lstatSync(this.scriptsDir)
      if (directoryScripts.isDirectory()) {
        this._scripts = coreUtils.file.getFoldersSync(this.scriptsDir, false)
        Array.prototype.forEach.call(this._scripts, (scriptEntry) => {
          const name = scriptEntry.path.replace(this.scriptsDir, '')
          const script = this.getPluginConfig(this.scriptsDir, name)
          this._plugins.push(script)
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

  getPluginConfig(dir, entry){
    // remove npm version if any
    let pluginId = entry.split('@')[0]

    // remove github version if any
    pluginId = pluginId.split('#')[0]

    // remove github path if any
    pluginId = path.basename(pluginId)

    let plugHook = path.join(dir, pluginId, config.hooks.url, 'hooks.js')
    let plugCustom = path.join(dir, pluginId, 'custom')
    let plugPartials = path.join(dir, pluginId, 'partials')
    let plugTemplates = path.join(dir, pluginId, 'templates')
    let plugProcess = path.join(dir, pluginId, 'process')
    let plugRoutes = path.join(dir, pluginId, 'routes')
    let plugin = {
      hooks : null,
      partials : null,
      templates : null,
      process : null,
      routes : null
    }

    try {
      var fileHook = fse.lstatSync(plugHook)
      if (fileHook.isFile()) {
        try {
          var h = require(plugHook)
        } catch(e){
          console.log(e.stack)
          console.log(
            clc.green('[ Hint ]'),
            'It seems that you don\'t have the npm module babel-preset-es2015 installed on your project'
          )
        }
        plugin.hooks = h.default
      }
    }catch(e) {
      plugin.hooks = null
    }

    try {
      var directoryCustom = fse.lstatSync(plugCustom)
      if (directoryCustom.isDirectory()) {
        plugin.custom = plugCustom
      }
    }catch(e) {
      plugin.custom = null
    }
    console.log(plugin)
    
    try {
      var directoryPartials = fse.lstatSync(plugPartials)
      if (directoryPartials.isDirectory()) {
        plugin.partials = plugPartials
      }
    }catch(e) {
      plugin.partials = null
    }
    
    try {
      var directoryTemplates = fse.lstatSync(plugTemplates)
      if (directoryTemplates.isDirectory()) {
        plugin.templates = plugTemplates
      }
    }catch(e) {
      plugin.templates = null
    }

    try {
      var directoryProcess = fse.lstatSync(plugProcess)
      if (directoryProcess.isDirectory()) {
        plugin.process = {}
        let processFiles = coreUtils.file.getFilesSync(plugProcess, false)
        Array.prototype.forEach.call(processFiles, (processFile) => {
          plugin.process[path.basename(processFile, '.js')] = processFile
        })
      }
    }catch(e) {
      plugin.process = null
    }

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
              let pathUrl = `/abe/plugin/${pluginId}/${path.basename(route, '.js')}*`
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
              let pathUrl = `/abe/plugin/${pluginId}/${path.basename(route, '.js')}*`
              let routeObject = {'path':route, 'routePath' : pathUrl}
              routesPost.push(routeObject)
            })
            plugin.routes.post = routesPost
          }
        }catch(e) {
          plugin.routes.post = null
        }
      }
    }catch(e) {
      plugin.routes = null
    }

    return plugin
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
          if(plugin.hooks != null && plugin.hooks[fn] != null) {
            args[0] = plugin.hooks[fn].apply(this, args)
          }
        })
      }
    } else {
      args = ['']
    }

    return args[0]
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

  getCustoms() {
    var customs = []
    Array.prototype.forEach.call(this._plugins, (plugin) => {
      if(typeof plugin.custom !== 'undefined' && plugin.custom !== null) {
        customs.push(plugin.custom)
      }
    })

    return customs
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

  removePlugin(plugin){
    let pluginName = plugin.split('@')[0]
    pluginName = pluginName.split('#')[0]
    if(config.localConfigExist()){
      let json = config.getLocalConfig()
      if(typeof json.plugins !== 'undefined' && json.plugins !== null) {
        Array.prototype.forEach.call(json.plugins, (plugged, index) => {
          if (pluginName === path.basename(plugged.split('@')[0].split('#')[0])) {
            json.plugins.splice(index, 1)
            config.save(json)
          }
        })
      }
    }
  }

  updatePlugin(plugin){
    let json = {}
    let createLocalConfig = true
    let pluginName = plugin.split('@')[0]
    pluginName = pluginName.split('#')[0]

    if(config.localConfigExist()){
      json = config.getLocalConfig()
      createLocalConfig = false
    }

    if(typeof json.plugins === 'undefined' || json.plugins === null) {
      json.plugins = [plugin]
    } else {
      var found = false
      Array.prototype.forEach.call(json.plugins, (plugged, index) => {
        if (pluginName === plugged.split('@')[0].split('#')[0]) {
          json.plugins[index] = plugin
          found = true
        }
      })
      if (!found) {
        json.plugins.push(plugin)
      }
    }

    if(createLocalConfig){
      console.log(
        clc.green('[ Hint ]'),
        'creating a local config abe.json with your plugin definition',
        clc.cyan.underline('https://github.com/abecms/abecms/blob/master/docs/abe-config.md')
      )
    }

    config.save(json)
  }

  uninstall(dir, plugin) {
    if(plugin !== null) {
      this.remove(dir, plugin)
      .then(function() {

        return 0
      })
    } else {
      console.log(clc.cyan('no plugin with this name found'))

      return 0
    }
  }

  install(dir, plugin = null) {
    if(plugin !== null) {
      this.add(dir, plugin)
      .then(function() {

        return 0
      })
    } else {
      if(config.plugins && Array.isArray(config.plugins)){
        var ps = []
        Array.prototype.forEach.call(config.plugins, (plugin) => {
          ps.push(this.add(dir, plugin))
        })
        
        Promise.all(ps)
        .then(function() {

          return 0 
        })
      } else {
        console.log(clc.cyan('no plugin found'))

        return 0
      }
    }
  }

  remove(dir, plugin) {
    var p = new Promise((resolve) => {
      try {
        console.log(clc.green('spawn'), clc.cyan('npm uninstall ' + plugin))
        // const npmUninstall = spawn('npm', ['uninstall', pluginDir]);
        const npmUninstall = spawn(npm, ['uninstall', '--save', plugin], { cwd: dir })

        npmUninstall.stdout.on('data', (data) => {
          console.log(''+data)
        })

        npmUninstall.stderr.on('data', (data) => {
          console.log(''+data)
        })

        npmUninstall.on('close', (code) => {
          console.log(clc.cyan('child process exited with code'), code)

          if(code == 0){
            this.removePlugin(plugin)
          }
          
          resolve()
        })

        npmUninstall.on('error', (err) => {
          console.log(clc.red('cannot uninstall npm dependencies for'), dir)
          console.log(err)
          resolve(err)
        })
      } catch (err) {
        console.log(clc.cyan('uninstall'), err)
        resolve(err)
      }
    })

    return p
  }

  add(dir, plugin) {
    var p = new Promise((resolve) => {
      try {
        console.log(clc.green('spawn'), clc.cyan('npm install ' + plugin))
        // const npmInstall = spawn('npm', ['install', pluginDir]);
        const npmInstall = spawn(npm, ['install', '--save', plugin], { cwd: dir })

        npmInstall.stdout.on('data', (data) => {
          console.log(''+data)
        })

        npmInstall.stderr.on('data', (data) => {
          console.log(''+data)
        })

        npmInstall.on('close', (code) => {
          console.log(clc.cyan('child process exited with code'), code)

          if(code == 0){
            this.updatePlugin(plugin)
          }
          
          resolve()
        })

        npmInstall.on('error', (err) => {
          console.log(clc.red('cannot install npm dependencies for'), dir)
          console.log(err)
          resolve(err)
        })
      } catch (err) {
        console.log(clc.cyan('install'), err)
        resolve(err)
      }
    })

    return p
  }
}

export default Plugins