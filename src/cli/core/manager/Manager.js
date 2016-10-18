import Handlebars from 'handlebars'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import path from 'path'
import watch from 'watch'
import {
  coreUtils,
  cmsData,
  config,
  cmsTemplates
} from '../../'

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

  init() {
    this._pathTemplate = path.join(config.root, config.templates.url)
    var p = new Promise((resolve) => {
      this._watchersStart()
      this.getKeysFromSelect()
        .then(() => {
          resolve()
        },
        (e) => {
          console.log('Manager.init', e)
          resolve()
        })
        .catch((e) => {
          console.log('Manager.init', e)
        })
    })

    return p
  }

  _watchersStart() {
    this._watchTemplate = watch.createMonitor(this._pathTemplate, (monitor) => {
      monitor.on("created", (f, stat) => {
        this.getKeysFromSelect()
      })
      monitor.on("changed", (f, curr, prev) => {
        this.getKeysFromSelect()
        
      })
      monitor.on("removed", (f, stat) => {
        this.getKeysFromSelect()
      })
    })
  }

  getKeysFromSelect() {
    this._whereKeys = []
    var p = new Promise((resolve) => {
      cmsTemplates.template.getSelectTemplateKeys(this._pathTemplate)
        .then((whereKeys) => {
          this._whereKeys = whereKeys
          this.updateList()
          resolve()
        },
        (e) => {
          console.log('Manager.getKeysFromSelect', e)
        })
        .catch((e) => {
          console.log('Manager.getKeysFromSelect', e)
        })
    })

    return p
  }

  getList() {

    return this._list
  }

  getListWithStatusOnFolder(status, folder = '') {
    var list = []
    folder = path.join(config.root, config.data.url, folder)
    Array.prototype.forEach.call(this._list, (file) => {
      if (typeof file[status] !== 'undefined' && file[status] !== null && file.path.indexOf(folder) > -1) {
        list.push(file)
      }
    })
    return list
  }

  setList(list) {
    this._list = list

    return this
  }

  updateList() {
    this._list = cmsData.file.getAllWithKeys(this._whereKeys)
    this._list.sort(coreUtils.sort.predicatBy('date', -1))
    console.log('Manager updated')
    
    return this
  }

  addHbsTemplate(templateId) {
    const pathTemplate = path.join(config.root, config.templates.url, 'hbs', templateId) + '.hbs'
    var tmpl = eval('(function(){return ' + fse.readFileSync(pathTemplate) + '}());')
    Handlebars.templates[templateId] = Handlebars.template(tmpl)
  }

  loadHbsTemplates() {
    const pathTemplate = path.join(config.root, config.templates.url, 'hbs')

    try {
      var directory = fse.lstatSync(pathTemplate)
      if (!directory.isDirectory()) {
        mkdirp.sync(pathTemplate)
      }
    } catch (e) {
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