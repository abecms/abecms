import path from 'path'
import fse from 'fs-extra'
import {init, log, trace, error, processConfig, getTime} from './initAbeForProcesses'

// IMPORT LIB
var Page = require('../../cli').Page
var cmsOperations = require('../../cli').cmsOperations
var abeExtend = require('../../cli').abeExtend
var Manager = require('../../cli').Manager
var cmsData = require('../../cli').cmsData
var cmsTemplates = require('../../cli').cmsTemplates
var config = require('../../cli').config
var templatesTexts = {}

function publishNext(files, tt, cb, i = 0) {
  var pub = files.shift()
  if(typeof pub !== 'undefined' && pub !== null) {
    // process.send is only defined in a child process
    if(typeof process.send === 'function'){
      process.send(JSON.stringify({percent: Math.round(((i+1)*100/tt) * 100) / 100, time: getTime()}))
    }

    var jsonObject = fse.readJsonSync(pub[processConfig.ABE_STATUS].path)
    i++
    var p = new Promise((resolve) => {
      if(typeof templatesTexts[jsonObject.abe_meta.template] === 'undefined' || templatesTexts[jsonObject.abe_meta.template] === null) {
        templatesTexts[jsonObject.abe_meta.template] = cmsTemplates.template.getTemplate(jsonObject.abe_meta.template)
      }

      cmsData.source.getDataList(path.dirname(jsonObject.abe_meta.link), templatesTexts[jsonObject.abe_meta.template], jsonObject, true)
        .then(() => {
          jsonObject = abeExtend.hooks.instance.trigger('afterGetDataListOnSave', jsonObject)

          var obj = {
            publishAll: true,
            type: jsonObject.abe_meta.status,
            json: {
              content: jsonObject
            }
          }

          var page = new Page(templatesTexts[jsonObject.abe_meta.template], obj.json.content, true)

          cmsOperations.save.saveHtml(
            path.join(config.root, processConfig.ABE_DESTINATION, jsonObject.abe_meta.link),
            page.html
          )
          
          // are there additional templates to export?
          if(obj.json.content.abe_meta.relatedTemplates){
            Object.keys(obj.json.content.abe_meta.relatedTemplates).map(function(key, index) {
              const relatedTemplate = obj.json.content.abe_meta.relatedTemplates[key]

              if(relatedTemplate.template && relatedTemplate.path){
                const relTemplate = cmsTemplates.template.getTemplate(relatedTemplate.template, obj.json.content)
                let extension = config.files.templates.extension
                if(relatedTemplate.extension)
                  extension = relatedTemplate.extension
                const fileName = path.basename(obj.json.content.abe_meta.link, '.'+config.files.templates.extension) + '.' + extension
                const relPath = path.join(config.root, processConfig.ABE_DESTINATION, relatedTemplate.path, fileName)

                cmsData.source.getDataList(path.dirname(obj.json.content.abe_meta.link), relTemplate, obj.json.content, true)
                .then(() => {
                  const page = new Page(relTemplate, obj.json.content, true)
                  cmsOperations.save.saveHtml(relPath, page.html)
                  resolve()
                })
              }
            })
          }

          obj = abeExtend.hooks.instance.trigger('afterSave', obj)

          trace('('+ getTime() + ') ' + i + ' - ' + pub[processConfig.ABE_STATUS].path.replace(config.root, '').replace(config.data.url, '') + ' (tpl: ' + jsonObject.abe_meta.template + ')')
          resolve()
        },
        () => {
          error('generate-posts ERROR on ' + pub[processConfig.ABE_STATUS].path.replace(config.root, '').replace(config.data.url, ''))
          resolve()
        })
    })
  
    p.then(function () {
      publishNext(files, tt, cb, i++)
    })
    .catch(function (e) {
      publishNext(files, tt, cb, i++)
      error('error', e)
    })
  }else {
    cb(i)
  }
}

function startProcess() {
  log('start publish all at path ' + processConfig.ABE_PATH)
  log('searching for file at ' + config.root)
  log('seach status: ' + processConfig.ABE_STATUS)
  log('save to: ' + path.join(config.root, processConfig.ABE_DESTINATION))
  var files = Manager.instance.getListWithStatusOnFolder(processConfig.ABE_STATUS, processConfig.ABE_PATH)

  log('Found ' + files.length + ' to republish')

  publishNext(files, files.length, function (i) {
    log('total ' + i + ' files')
    log('publish process finished ' + getTime())
    if(typeof process.send === 'function'){
      process.send(JSON.stringify({msg: 'exit'}))
    }
    process.exit(0)
  })
}

init('generate-posts',
  {
    ABE_STATUS: 'publish',
    ABE_PATH: '',
    ABE_DESTINATION: 'site'
  })
  .then(startProcess,
  (msg) => {
    if(typeof process.send === 'function'){
      process.send(JSON.stringify({msg: 'exit'}))
    }
    error(msg)
    process.exit(0)
  })