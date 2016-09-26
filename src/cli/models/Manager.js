import Handlebars from 'handlebars'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import path from 'path'
import {
  config,
  FileParser,
  fileUtils,
  folderUtils,
  TimeMesure,
  getSelectTemplateKeys
} from '../../cli'

import * as redis from '../services/RedisClient'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Manager {

  constructor(enforcer) {

    if(enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'
    
    Handlebars.templates = Handlebars.templates || {}
    this.loadHbsTemplates()
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Manager(singletonEnforcer)
    }
    return this[singleton]
  }

  getList() {
    if(config.redis.enable){
      redis.get().get('list', function(err, reply) {
        this._list = JSON.parse(reply)
      })
    }

    return this._list
  }

  setList(list) {
    if(config.redis.enable){
      redis.get().set('list', JSON.stringify(list))
    }
    this._list = list

    return this
  }

  init() {
    var p = new Promise((resolve, reject) => {
      this._loadTime = new TimeMesure('Loading Manager')
      const pathTemplate = path.join(config.root, config.templates.url)
      getSelectTemplateKeys(pathTemplate)
        .then((whereKeys) => {
          this._whereKeys = whereKeys
          this.updateList()
          resolve()
        })
        .catch((e) => {
          console.log('Manager._init', e)
        })
    })

    return p
  }

  updateList() {
    this._list = FileParser.getAllFilesWithKeys(this._whereKeys)
    this._list.sort(FileParser.predicatBy('date', -1))
    if(config.redis.enable){
      redis.get().set('list', JSON.stringify(this._list))
    }
    this._loadTime.duration()

    return this
  }

  addHbsTemplate(templateId) {
    const pathTemplate = path.join(config.root, config.templates.url, 'hbs', templateId) + '.hbs'
    var tmpl = eval('(function(){return ' + fse.readFileSync(pathTemplate) + '}());')
    Handlebars.templates[templateId] = Handlebars.template(tmpl)
  }

  loadHbsTemplates() {
    const pathTemplate = path.join(config.root, config.templates.url, 'hbs')

    if(!folderUtils.isFolder(pathTemplate)) {
      mkdirp.sync(pathTemplate)
    }

    fse.readdirSync(pathTemplate).forEach(function (file) {
      if (file.indexOf('.hbs') > -1) {
        let originalTemplatePath = path.join(config.root, config.templates.url) + '/' + file.replace('.hbs', '.' + config.files.templates.extension)
        
        try{
          let originalTemplateStat = fse.statSync(originalTemplatePath)
          let originalTemplateMdate = originalTemplateStat.mtime
          let stat = fse.statSync(path.join(pathTemplate, file))
          let mdate = stat.mtime

          // if the original template has been updated after precompilation, I delete the precompiled file
          // else I add it to the hbs template array
          if(originalTemplateMdate>mdate){
            fse.unlinkSync(path.join(pathTemplate, file))
          } else {
            var tmpl = eval('(function(){return ' + fse.readFileSync(path.join(pathTemplate, file)) + '}());')
            Handlebars.templates[file.replace('.hbs', '')] = Handlebars.template(tmpl)
          }
        }
        catch(err) {
          console.log('The original template has not been found or the hbs template is corrupted')
          console.log(originalTemplatePath)
          console.log(err)
        } 
      }
    })
  }
}

export default Manager