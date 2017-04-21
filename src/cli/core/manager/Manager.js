//import Handlebars from 'handlebars'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import events from 'events'
import path from 'path'
import watch from 'watch'
import {
  coreUtils,
  cmsData,
  config,
  cmsTemplates,
  cmsReference,
  cmsMedia,
  cmsOperations
} from '../../'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Manager {

  constructor(enforcer) {

    if(enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'
    

    //Handlebars.templates = Handlebars.templates || {}
    //this.loadHbsTemplates()
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Manager(singletonEnforcer)
    }
    return this[singleton]
  }

  init() {
    this._processesRunning = {}
    this._pathPartials = path.join(config.root, config.partials)
    this._pathTemplate = path.join(config.root, config.templates.url)
    this._pathStructure = path.join(config.root, config.structure.url)
    this._pathReference = path.join(config.root, config.reference.url)
    this._pathData = path.join(config.root, config.data.url)
    this._watchersStart()
    this.connections = [],
    this.activities = [],

    this.updateStructureAndTemplates()
    this.getAutoGenerateTemplates()
    var p = new Promise((resolve) => {
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
    this.events = {
      template: new events.EventEmitter(0),
      structure: new events.EventEmitter(0),
      reference: new events.EventEmitter(0),
      activity: new events.EventEmitter(0),
    }

    this.events.activity.on('activity', function(data) {
      this.addActivity(data)
      this.events.activity.emit("activity-stream", data)
    }.bind(this));

    // watch template folder
    try {
      fse.accessSync(this._pathTemplate, fse.F_OK)
      this._watchTemplateFolder = watch.createMonitor(this._pathTemplate, (monitor) => {
        monitor.on('created', () => {
          this.getKeysFromSelect()
          this.updateStructureAndTemplates()
          this.events.template.emit('update')
        })
        monitor.on('changed', () => {
          this.getKeysFromSelect()
          this.updateStructureAndTemplates()
          this.events.template.emit('update')
          
        })
        monitor.on('removed', () => {
          this.getKeysFromSelect()
          this.updateStructureAndTemplates()
          this.events.template.emit('update')
        })
      })
    } catch (e) {
      console.log('the directory ' + this._pathTemplate + ' does not exist')
    }

    // watch partial folder
    try {
      fse.accessSync(this._pathPartials, fse.F_OK)
      this._watchPartialsFolder = watch.createMonitor(this._pathPartials, (monitor) => {
        monitor.on('created', () => {
          this.getKeysFromSelect()
          this.updateStructureAndTemplates()
          this.events.template.emit('update')
        })
        monitor.on('changed', () => {
          this.getKeysFromSelect()
          this.updateStructureAndTemplates()
          this.events.template.emit('update')
          
        })
        monitor.on('removed', () => {
          this.getKeysFromSelect()
          this.updateStructureAndTemplates()
          this.events.template.emit('update')
        })
      })
    } catch (e) {
      console.log('the directory ' + this._pathPartials + ' does not exist')
    }

    try {
      fse.accessSync(this._pathStructure, fse.F_OK)
      this._watchStructure = watch.createMonitor(this._pathStructure, (monitor) => {
        monitor.on('created', () => {
          this.updateStructureAndTemplates()
          this.events.structure.emit('update')
        })
        monitor.on('changed', () => {
          this.updateStructureAndTemplates()
          this.events.structure.emit('update')
        })
        monitor.on('removed', () => {
          this.updateStructureAndTemplates()
          this.events.structure.emit('update')
        })
      })
    } catch (e) {
      console.log('the directory ' + this._pathStructure + ' does not exist')
    }
    
    try {
      fse.accessSync(this._pathReference, fse.F_OK)
      this._watchReferenceFolder = watch.createMonitor(this._pathReference, (monitor) => {
        monitor.on('created', (f) => {
          this.updateReferences(f)
          this.events.reference.emit('update')
        })
        monitor.on('changed', (f) => {
          this.updateReferences(f)
          this.events.reference.emit('update')
          
        })
        monitor.on('removed', () => {
          this.updateReferences()
          this.events.reference.emit('update')
        })
      })
    } catch (e) {
      console.log('the directory ' + this._pathReference + ' does not exist')
    }
  }

  getKeysFromSelect() {
    this._whereKeys = []
    var p = new Promise((resolve) => {

      cmsTemplates.template.getTemplatesAndPartials(this._pathTemplate, this._pathPartials)
      .then((templatesList) => {

        return cmsTemplates.template.getTemplatesTexts(templatesList)
        .then((templatesText) => {

          return cmsTemplates.template.getAbeRequestWhereKeysFromTemplates(templatesText)
          .then((whereKeys) => {
            this._whereKeys = whereKeys
            this._slugs = cmsTemplates.template.getAbeSlugFromTemplates(templatesText)
            this._precontribution = cmsTemplates.template.getAbePrecontribFromTemplates(templatesText)
            this.updateList()
            resolve()
          },
          (e) => { console.log('Reject: Manager.findRequestColumns', e) })
          .catch((e) => { console.log('Error: Manager.findRequestColumns', e) })
        },
        (e) => { console.log('Reject: Manager.getTemplatesTexts', e) })
        .catch((e) => { console.log('Error: Manager.getTemplatesTexts', e) })
      },
      (e) => { console.log('Manager.getKeysFromSelect', e) })
      .catch((e) => { console.log('Manager.getKeysFromSelect', e) })
    })

    return p
  }

  getStructureAndTemplates() {

    return this._structureAndTemplates
  }

  updateStructureAndTemplates() {
    this._structureAndTemplates = cmsTemplates.template.getStructureAndTemplates()
  }

  getAutoGenerateTemplates() {
    this.updateStructureAndTemplates()
    cmsTemplates.template.getAutoGenerateTemplates(this._structureAndTemplates.templates)
  }

  getThumbsList() {
    if(typeof this._thumbs === 'undefined' || this._thumbs === null) this._thumbs = cmsMedia.image.getThumbsList()
    return this._thumbs
  }

  addThumbsToList(thumb) {
    if(this._thumbs) this._thumbs.push(thumb)
  }

  getReferences() {
    if(typeof this._references === 'undefined' || this._references === null) this.updateReferences()
    return this._references
  }

  getPrecontribution() {
    return this._precontribution
  }

  getSlugs() {
    return this._slugs
  }

  updateReferences(referenceName) {
    var references = cmsReference.reference.getFiles()
    if(referenceName && references[referenceName]) this._references[referenceName] = references[referenceName]
    else this._references = references
    
    return this
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

  /**
   * return true if postUrl is found in the Manager list
   * @param {String} postUrl The url path of the file
   */
  postExist(postUrl){
    var parentRelativePath = cmsData.fileAttr.delete(postUrl.split('/').join(path.sep).replace(`.${config.files.templates.extension}`, '.json')).replace(/^\//, '')
    const found = coreUtils.array.find(this._list, 'parentRelativePath', parentRelativePath)

    if (found.length > 0) {
      return true
    }
    return false
  }

  /**
   * When a post is modified or created, this method is called so that the manager updates the list with the updated/new item
   * @param {String} pathFile The full path to the post
   */
  updatePostInList(pathFile){
    const parentRelativePath = cmsData.fileAttr.delete(pathFile).replace(this._pathData + path.sep, '')
    if(typeof this._list === 'undefined' || this._list === null) this.updateList()
    const found = coreUtils.array.find(this._list, 'parentRelativePath', parentRelativePath)
    const json = cmsData.file.get(pathFile)
    let index
    let merged = {}
    let revision = cmsData.file.getFileObject(pathFile)
    revision = cmsData.file.getAbeMeta(revision, json)
    Array.prototype.forEach.call(this._whereKeys, (key) => {
      var keyFirst = key.split('.')[0]
      revision[keyFirst] = json[keyFirst]
    })

    if(found.length > 0){
      index = found[0]
      merged[parentRelativePath] = this._list[index]
      // If I publish, I remove the previous published versions
      if(revision.abe_meta.status === 'publish'){
        Array.prototype.forEach.call(merged[parentRelativePath].revisions, (revision, revIndex) => {
          if(revision.abe_meta.status === 'publish'){
            merged[parentRelativePath].revisions.splice(revIndex,1)
          }
        })
      }
      merged[parentRelativePath].revisions.push(JSON.parse(JSON.stringify(revision)))
      const sortedResult = cmsData.revision.sortRevisions(merged)
      // Does the publish version has been removed (in the case of unpublish) ? 
      if(sortedResult[0]['publish'] && !coreUtils.file.exist(sortedResult[0]['publish']['path'])){
        delete sortedResult[0]['publish']
      }
      this._list[index] = sortedResult[0]
    } else {
      index = this._list.length
      let rev = []
      rev.push(revision)
      merged = cmsData.revision.mergeRevisions(rev)
      const sortedResult = cmsData.revision.sortRevisions(merged)
      this._list.push(sortedResult[0])
    }

    this._list.sort(coreUtils.sort.predicatBy('date', -1))
    this.historize(index)
  }

  /**
   * When data.history is set, we do keep the number of revisions = history in the most recent date order
   * @param  {[type]} index [description]
   * @return {[type]}       [description]
   */
  historize(index){
    if(config.data.history && config.data.history > 0){
      let arStatus = []
      if(this._list[index].revisions.length > config.data.history){
        Array.prototype.forEach.call(this._list[index].revisions, (revision, revIndex) => {
          if(revIndex >= config.data.history){
            if(revision.abe_meta.status === 'publish'){
              if(arStatus.indexOf(revision.abe_meta.status) < 0){
                arStatus.push(revision.abe_meta.status)
              } else {
                this._list[index].revisions.splice(revIndex,1)
              }
            } else {
              this._list[index].revisions.splice(revIndex,1)
              cmsOperations.remove.removeFile(revision.path)
            }
          } else if(arStatus.indexOf(revision.abe_meta.status) < 0){
              arStatus.push(revision.abe_meta.status)
          }
        })
      }
    }
  }

  /**
   * When a post is deleted, this method is called so that the manager updates the list with the removed item
   * @param {String} pathFile The full path to the post
   */
  removePostFromList(pathFile){
    let parentRelativePath = cmsData.fileAttr.delete(pathFile)
    parentRelativePath = (pathFile.indexOf(path.sep) === 0) ? parentRelativePath.substring(1):parentRelativePath
    parentRelativePath = parentRelativePath.replace('.' + config.files.templates.extension, '.json')
    this._list = coreUtils.array.removeByAttr(this._list, 'parentRelativePath', parentRelativePath)
  }

  /**
   * This method loads all posts into an array with values used in "select" statements from templates
   * + abe_meta data
   * @return {Array} Array of objects representing the posts including their revisions
   */
  updateList() {
    this._list = cmsData.file.getAllWithKeys(this._whereKeys)
    this._list.sort(coreUtils.sort.predicatBy('date', -1))
    console.log('Manager updated')
  }

  getPage(
    start = 0,
    length = 20,
    sortField = 'date',
    sortDir = -1,
    search = '',
    searchFields = ['abe_meta.link', 'abe_meta.template']
  ){
    const total = this._list.length
    let totalFiltered = total
    let list = this._list.slice()

    if(search !== '') {
      const searches = search.split(' ')
      for(var i = 0; i < searches.length; i++){
        list = coreUtils.array.facet(list, searchFields, searches[i])
      }

      totalFiltered = list.length
    }

    if(sortField != 'date' || sortDir != -1){
      list.sort(coreUtils.sort.predicatBy(sortField, sortDir))
    }
    
    list = list.slice(start, start + length)

    return {
      'recordsTotal': total,
      'recordsFiltered': totalFiltered,
      'data': list
    }
  }

  /**
   * DEPRECATED
   * @param {[type]} templateId [description]
   */
  /*
  addHbsTemplate(templateId) {
    const pathTemplate = path.join(config.root, config.templates.url, 'hbs', templateId) + '.hbs'
    var tmpl = eval('(function(){return ' + fse.readFileSync(pathTemplate) + '}());')
    Handlebars.templates[templateId] = Handlebars.template(tmpl)
  }
  */

  /**
   * DEPRECATED
   * @return {[type]} [description]
   */
  /*
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
  */
 
  addProcess(name) {
    this._processesRunning[name] = true
  }

  removeProcess(name) {
    delete this._processesRunning[name]
  }

  isProcessRunning(name) {
    if(this._processesRunning[name] !== null && this._processesRunning[name] === true) {
      return true
    }else {
      return false
    }
  }

  getActivities() {
    return this.activities
  }

  addActivity(activity) {
    if (this.activities.length > 50)
      this.activities.shift()

    this.activities.push(activity)
  }

  getConnections() {
    return this.connections
  }

  addConnection(res) {
    this.connections.push(res);
  }

  removeConnection(res) {
    var i = this.connections.indexOf(res);
    if (i !== -1) {
      this.connections.splice(i, 1);
    }
  }
}

export default Manager