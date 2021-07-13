//import Handlebars from 'handlebars'
import fs from 'fs'
import events from 'events'
import path from 'path'
import watch from 'watch'
import express from 'express'
import bodyParser from 'body-parser'
import tinylr from 'tiny-lr'
import clc from 'cli-color'
import {
  coreUtils,
  cmsData,
  config,
  cmsTemplates,
  cmsReference,
  cmsMedia,
  cmsOperations,
  abeExtend,
  User
} from '../../'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Manager {
  constructor(enforcer) {
    if (enforcer != singletonEnforcer) throw 'Cannot construct Json singleton'
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new Manager(singletonEnforcer)
    }
    return this[singleton]
  }

  async init() {
    this._processesRunning = {}
    this.events = {}

    // Compatibility for abe version < 3.2.
    // It's possible to reference html from any directory
    if (process.env.ABE_TEMPLATES_PATH) {
      this.pathTemplates = path.join(
        config.root,
        process.env.ABE_TEMPLATES_PATH
      )
      this.pathPartials = path.join(this.pathTemplates, 'partials')
    } else if (
      config.themes != null &&
      coreUtils.file.exist(
        path.join(
          config.root,
          config.themes.path,
          config.themes.name,
          config.themes.templates.path
        )
      )
    ) {
      this.pathTemplates = path.join(
        config.root,
        config.themes.path,
        config.themes.name,
        config.themes.templates.path
      )
      this.pathPartials = path.join(
        config.root,
        config.themes.path,
        config.themes.name,
        config.themes.partials.path
      )
    } else {
      // did the users of the versions < 3.2 overriden the default templates path or partials path ?
      if (config.templates != null && config.templates.url != null) {
        this.pathTemplates = path.join(config.root, config.templates.url)
      } else {
        this.pathTemplates = path.join(config.root, 'templates')
      }
      if (config.partials != null) {
        this.pathPartials = path.join(config.root, config.partials)
      } else {
        this.pathPartials = path.join(config.root, 'partials')
      }
    }

    this.pathAssets = this.pathTemplates
    if (process.env.ABE_ASSETS_PATH) {
      this.pathAssets = path.join(config.root, process.env.ABE_ASSETS_PATH)
    }
    this.pathPublish = path.join(config.root, config.publish.url)
    if (process.env.ABE_DESTINATION_PATH) {
      this.pathPublish = path.join(
        config.root,
        process.env.ABE_DESTINATION_PATH
      )
    }

    // config.data.url was the config prior to v3.7.0
    if (process.env.ABE_JSON_PATH) {
      this.pathData = path.join(config.root, process.env.ABE_JSON_PATH)
    } else if (config.data.url != null) {
      this.pathData = path.join(config.root, config.data.url)
    } else if (coreUtils.file.exist(path.join(config.root, config.data.path))) {
      this.pathData = path.join(config.root, config.data.path)
    } else {
      this.pathData = path.join(config.root, 'data')
    }

    this.pathTemplates = this.pathTemplates.replace(/\/$/, '')
    this.pathPartials = this.pathPartials.replace(/\/$/, '')
    this.pathAssets = this.pathAssets.replace(/\/$/, '')
    this.pathPublish = this.pathPublish.replace(/\/$/, '')
    this.pathData = this.pathData.replace(/\/$/, '')
    this.pathScripts = path.join(config.root, config.scripts.path)

    this.pathStructure = path.join(config.root, config.structure.url)
    this.pathReference = path.join(config.root, config.reference.url)
    this.pathLocales = path.join(config.root, 'locales')

    this.connections = []

    this.activities =  User.utils.getActivity()

    this._watcherActivity()

    this.updateStructureAndTemplates()

    await this.getKeysFromSelect()
  }

  initDev() {
    console.log(`You are in ${process.env.NODE_ENV} mode`)
    console.log(
      'which means every change in your themes (templates, partials and assets), reference and structure folders will dynamically update your site'
    )
    console.log("In production, this mode shouldn't be used.")

    this._watchersStart()

    var lport = process.env.LIVERELOAD_PORT || 35729
    this.lserver = express()

    // Launching a Livereload server
    this.lserver
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({extended: true}))
      .use(tinylr.middleware({app: this.lserver}))
      .listen(lport, function() {
        console.log('Livereload listening on %d', lport)
      })
      .on('error', function(err) {
        if (err.code == 'EADDRINUSE') {
          console.error(
            clc.red("can't start the Abe's watch server\n"),
            `This watch server has tried to listen on the port ${lport} but this server is already in use by another process...`
          )
        } else {
          console.error(err)
        }
      })

    process.on('SIGINT', () => {
      try {
        this.lserver.close(() => {
          console.log('SIGINT:Livereload server has been gracefully terminated')
          process.exit(0)
        })
      } catch (error) {}
    })
    process.on('SIGTERM', () => {
      try {
        this.lserver.close(() => {
          console.log(
            'SIGTERM:Livereload server has been gracefully terminated'
          )
          process.exit(0)
        })
      } catch (error) {}
    })

    // sync assets from templates to /site
    cmsTemplates.assets.copy()
  }

  _watcherActivity() {
    this.events.activity = new events.EventEmitter(0)

    this.events.activity.on(
      'activity',
      function(data) {
        data.time = new Date().toISOString()
        if (data.user && data.user.username) {
          data.user = data.user.username
        } else {
          data.user = 'admin'
        }
        this.addActivity(data)
        this.events.activity.emit('activity-stream', data)
      }.bind(this)
    )
  }

  _watchersStart() {
    this.events.template = new events.EventEmitter(0)
    this.events.structure = new events.EventEmitter(0)
    this.events.reference = new events.EventEmitter(0)
    this.events.scripts = new events.EventEmitter(0)
    this.events.locales = new events.EventEmitter(0)

    // watch template folder
    try {
      fs.accessSync(this.pathTemplates, fs.F_OK)
      this._watchTemplateFolder = watch.createMonitor(
        this.pathTemplates,
        monitor => {
          monitor.on('created', (f, stat) => {
            if (f.indexOf(`.${config.files.templates.extension}`) < 0) {
              cmsTemplates.assets.copy()
              tinylr.changed(f)
              console.log(
                'Assets have been synchronized after this creation: ' + f
              )
            } else {
              this.getKeysFromSelect()
              this.updateStructureAndTemplates()
              if (typeof this.lserver != 'undefined') {
                tinylr.changed(f)
              }
              this.events.template.emit('update')
            }
          })
          monitor.on('changed', (f, curr, prev) => {
            if (f.indexOf(`.${config.files.templates.extension}`) < 0) {
              cmsTemplates.assets.copy()
              if (typeof this.lserver != 'undefined') {
                tinylr.changed(f)
              }
              console.log(
                'Assets have been synchronized after this modification: ' + f
              )
            } else {
              this.getKeysFromSelect()
              this.updateStructureAndTemplates()
              if (typeof this.lserver != 'undefined') {
                tinylr.changed(f)
              }
              this.events.template.emit('update')
            }
          })
          monitor.on('removed', (f, stat) => {
            if (f.indexOf(`.${config.files.templates.extension}`) < 0) {
              cmsTemplates.assets.copy()
              if (typeof this.lserver != 'undefined') {
                tinylr.changed(f)
              }
              console.log(
                'Assets have been synchronized after this deletion: ' + f
              )
            } else {
              this.getKeysFromSelect()
              this.updateStructureAndTemplates()
              if (typeof this.lserver != 'undefined') {
                tinylr.changed(f)
              }
              this.events.template.emit('update')
            }
          })
        }
      )
    } catch (e) {
      console.log('the directory ' + this.pathTemplates + ' does not exist')
    }

    // watch partial folder
    try {
      fs.accessSync(this.pathPartials, fs.F_OK)
      this._watchPartialsFolder = watch.createMonitor(
        this.pathPartials,
        monitor => {
          monitor.on('created', f => {
            this.getKeysFromSelect()
            this.updateStructureAndTemplates()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.template.emit('update')
          })
          monitor.on('changed', f => {
            this.getKeysFromSelect()
            this.updateStructureAndTemplates()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.template.emit('update')
          })
          monitor.on('removed', f => {
            this.getKeysFromSelect()
            this.updateStructureAndTemplates()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.template.emit('update')
          })
        }
      )
    } catch (e) {
      console.log('the directory ' + this.pathPartials + ' does not exist')
    }

    // watch structure folder
    try {
      fs.accessSync(this.pathStructure, fs.F_OK)
      this._watchStructure = watch.createMonitor(
        this.pathStructure,
        monitor => {
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
        }
      )
    } catch (e) {
      console.log('the directory ' + this.pathStructure + ' does not exist')
    }

    // watch reference folder
    try {
      fs.accessSync(this.pathReference, fs.F_OK)
      this._watchReferenceFolder = watch.createMonitor(
        this.pathReference,
        monitor => {
          monitor.on('created', f => {
            this.updateReferences(f)
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.reference.emit('update')
          })
          monitor.on('changed', f => {
            this.updateReferences(f)
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.reference.emit('update')
          })
          monitor.on('removed', f => {
            this.updateReferences()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.reference.emit('update')
          })
        }
      )
    } catch (e) {
      console.log('the directory ' + this.pathReference + ' does not exist')
    }

    // watch locales folder
    try {
      fs.accessSync(this.pathLocales, fs.F_OK)
      this._watchLocalesFolder = watch.createMonitor(
        this.pathLocales,
        monitor => {
          monitor.on('created', f => {
            coreUtils.locales.instance.reloadLocales()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.locales.emit('update')
          })
          monitor.on('changed', f => {
            coreUtils.locales.instance.reloadLocales()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.locales.emit('update')
          })
          monitor.on('removed', f => {
            coreUtils.locales.instance.reloadLocales()
            if (typeof this.lserver != 'undefined') {
              tinylr.changed(f)
            }
            this.events.locales.emit('update')
          })
        }
      )
    } catch (e) {
      console.log('the directory ' + this.pathLocales + ' does not exist')
    }

    // watch scripts folder
    try {
      fs.accessSync(this.pathScripts, fs.F_OK)
      this._watchScripts = watch.createMonitor(this.pathScripts, monitor => {
        monitor.on('created', () => {
          abeExtend.plugins.instance.updateScripts()
          this.events.scripts.emit('update')
        })
        monitor.on('changed', () => {
          abeExtend.plugins.instance.updateScripts()
          this.events.scripts.emit('update')
        })
        monitor.on('removed', () => {
          abeExtend.plugins.instance.updateScripts()
          this.events.scripts.emit('update')
        })
      })
    } catch (e) {
      console.log('the directory ' + this.pathScripts + ' does not exist')
    }
  }

  getKeysFromSelect() {
    this._whereKeys = []
    var p = new Promise(resolve => {
      cmsTemplates.template
        .getTemplatesAndPartials(this.pathTemplates, this.pathPartials)
        .then(
          templatesList => {
            return cmsTemplates.template
              .getTemplatesTexts(templatesList)
              .then(
                templatesText => {
                  return cmsTemplates.template
                    .getAbeRequestWhereKeysFromTemplates(templatesText)
                    .then(
                      async whereKeys => {
                        this._whereKeys = whereKeys
                        this._slugs = cmsTemplates.template.getAbeSlugFromTemplates(
                          templatesText
                        )
                        this._precontribution = cmsTemplates.template.getAbePrecontribFromTemplates(
                          templatesText
                        )
                        await this.updateList()
                        resolve()
                      },
                      e => {
                        console.log(
                          'Reject: Manager.findRequestColumns',
                          e.stack
                        )
                      }
                    )
                    .catch(e => {
                      console.log('Error: Manager.findRequestColumns', e.stack)
                    })
                },
                e => {
                  console.log('Reject: Manager.getTemplatesTexts', e.stack)
                }
              )
              .catch(e => {
                console.log('Error: Manager.getTemplatesTexts', e.stack)
              })
          },
          e => {
            console.log('Manager.getKeysFromSelect', e.stack)
          }
        )
        .catch(e => {
          console.log('Manager.getKeysFromSelect', e.stack)
        })
    })

    return p
  }

  getStructureAndTemplates() {
    return this._structureAndTemplates
  }

  updateStructureAndTemplates() {
    this._structureAndTemplates = cmsTemplates.template.getStructureAndTemplates()
  }

  getThumbsList() {
    if (typeof this._thumbs === 'undefined' || this._thumbs === null)
      this._thumbs = cmsMedia.image.getThumbsList()
    return this._thumbs
  }

  addThumbsToList(thumb) {
    if (this._thumbs) this._thumbs.push(thumb)
  }

  getReferences() {
    if (typeof this._references === 'undefined' || this._references === null)
      this.updateReferences()
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
    if (referenceName && references[referenceName])
      this._references[referenceName] = references[referenceName]
    else this._references = references

    return this
  }

  getList() {
    return this._list
  }

  getListWithStatusOnFolder(status, subPath = '') {
    let list = []
    const subPathFull = `${subPath.replace(/^\/|\/$/g, '')}/`

    Array.prototype.forEach.call(this._list, file => {
      if (
        typeof file[status] !== 'undefined' &&
        file[status] !== null &&
        ( subPath === '' || file.path.startsWith(subPathFull))
      ) {
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
  postExist(postUrl) {
    const docPath = cmsData.utils.getDocRelativePathFromPostUrl(postUrl)
    const found = coreUtils.array.find(this._list, 'path', docPath)

    if (found.length > 0) {
      return true
    }
    return false
  }

  /**
   * When a post is modified or created, this method is called so that the manager updates the list with the updated/new item
   * @param {String} revisionPath The full path to the post
   */
  async updatePostInList(revisionPath) {
    const docPath = cmsData.utils.getDocRelativePath(revisionPath)
    const found = coreUtils.array.find(this._list, 'path', docPath)
    const json = await cmsData.revision.getDoc(revisionPath)
    let index
    let merged = {}
    let revision = cmsData.revision.getFileObject(revisionPath, json)
    revision = cmsData.file.getAbeMeta(revision, json)
    Array.prototype.forEach.call(this._whereKeys, key => {
      var keyFirst = key.split('.')[0]
      revision[keyFirst] = json[keyFirst]
    })

    if (found.length > 0) {
      index = found[0]
      merged[docPath] = this._list[index]
      // If I publish, I remove the previous published versions
      if (revision.abe_meta.status === 'publish') {
        Array.prototype.forEach.call(
          merged[docPath].revisions,
          (revision, revIndex) => {
            if (revision.abe_meta.status === 'publish') {
              merged[docPath].revisions.splice(revIndex, 1)
            }
          }
        )
      }
      merged[docPath].revisions.push(JSON.parse(JSON.stringify(revision)))
      const sortedResult = cmsData.revision.sortRevisions(merged)
      // Does the publish version has been removed (in the case of unpublish) ?
      if (
        sortedResult[0]['publish'] &&
        !cmsData.revision.exist(sortedResult[0]['publish']['path'])
      ) {
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
  historize(index) {
    if (config.data.history && config.data.history > 0) {
      let arStatus = []
      if (this._list[index].revisions.length > config.data.history) {
        Array.prototype.forEach.call(
          this._list[index].revisions,
          (revision, revIndex) => {
            if (revIndex >= config.data.history) {
              if (revision.abe_meta.status === 'publish') {
                if (arStatus.indexOf(revision.abe_meta.status) < 0) {
                  arStatus.push(revision.abe_meta.status)
                } else {
                  this._list[index].revisions.splice(revIndex, 1)
                }
              } else {
                this._list[index].revisions.splice(revIndex, 1)
                cmsOperations.remove.removeRevision(revision.path)
              }
            } else if (arStatus.indexOf(revision.abe_meta.status) < 0) {
              arStatus.push(revision.abe_meta.status)
            }
          }
        )
      }
    }
  }

  /**
   * When a post is deleted, this method is called so that the manager updates the list with the removed item
   * @param {String} postUrl The URL of the post
   */
  removePostFromList(postUrl) {
    const docPath = cmsData.utils.getDocRelativePathFromPostUrl(postUrl)
    this._list = coreUtils.array.removeByAttr(this._list, 'path', docPath)
  }

  /**
   * This method loads all posts into an array with values used in "select" statements from templates
   * + abe_meta data
   * @return {Array} Array of objects representing the posts including their revisions
   */
  async updateList() {
    this._list = await cmsData.revision.getAllWithKeys(this._whereKeys)
    this._list.sort(coreUtils.sort.predicatBy('date', -1))
    console.log('Manager updated')
  }

  getPage(
    start = 0,
    length = 20,
    sortField = 'date',
    sortDir = -1,
    search = '',
    searchFields = ['abe_meta.link', 'abe_meta.template', 'name']
  ) {
    const total = this._list.length
    let totalFiltered = total
    let list = this._list.slice()

    if (search !== '') {
      const searches = search.split(' ')
      for (var i = 0; i < searches.length; i++) {
        list = coreUtils.array.facet(list, searchFields, searches[i])
      }

      totalFiltered = list.length
    }

    if (sortField != 'date' || sortDir != -1) {
      list.sort(coreUtils.sort.predicatBy(sortField, sortDir))
    }

    list = list.slice(start, start + length)

    return {
      recordsTotal: total,
      recordsFiltered: totalFiltered,
      data: list
    }
  }

  addProcess(name) {
    this._processesRunning[name] = true
  }

  removeProcess(name) {
    delete this._processesRunning[name]
  }

  isProcessRunning(name) {
    if (
      this._processesRunning[name] !== null &&
      this._processesRunning[name] === true
    ) {
      return true
    } else {
      return false
    }
  }

  getActivities() {
    return User.utils.getActivity()
  }

  addActivity(activity) {
    User.utils.addActivity(activity)
  }

  getConnections() {
    return this.connections
  }

  addConnection(res) {
    this.connections.push(res)
  }

  removeConnection(res) {
    var i = this.connections.indexOf(res)
    if (i !== -1) {
      this.connections.splice(i, 1)
    }
  }
}

export default Manager
