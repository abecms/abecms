import path from 'path'
import moment from 'moment'
import fse from 'fs-extra'
import debug from 'debug'
var log = debug('generate-posts:log')
log.color = 2
var traceLog = debug('generate-posts:trace')
var errorLog = debug('generate-posts:error')
errorLog.color = 1

var pConfig = {}
Array.prototype.forEach.call(process.argv, (item) => {
  if (item.indexOf('=') > -1) {
    var ar = item.split('=')
    pConfig[ar[0]] = ar[1]
  }
})

if(typeof pConfig.ABE_PATH === 'undefined' || pConfig.ABE_PATH === null) {
  pConfig.ABE_PATH = ''
}

if(typeof pConfig.ABE_DESTINATION === 'undefined' || pConfig.ABE_DESTINATION === null) {
  pConfig.ABE_DESTINATION = 'site'
}

log('loading dependencies...');
var dateStart
var templatesTexts = {}

function publishNext(published, tt, cb, i = 0) {
  var pub = published.shift()
  if(typeof pub !== 'undefined' && pub !== null) {
    
    var jsonObject = fse.readJsonSync(pub.path)
    if(typeof jsonObject.abe_meta !== 'undefined' && jsonObject.abe_meta !== null) {
      i++
      var p = new Promise((resolve) => {
        if(typeof templatesTexts[jsonObject.abe_meta.template] === 'undefined' || templatesTexts[jsonObject.abe_meta.template] === null) {
          templatesTexts[jsonObject.abe_meta.template] = cmsTemplates.template.getTemplate(jsonObject.abe_meta.template)
        }

        cmsData.source.getDataList(path.dirname(jsonObject.abe_meta.link), templatesTexts[jsonObject.abe_meta.template], jsonObject, true)
          .then(() => {
            jsonObject = abeExtend.hooks.instance.trigger('afterGetDataListOnSave', jsonObject)

            var obj = {
              publishAll:true,
              type: jsonObject.abe_meta.status,
              json: {
                content: jsonObject
              }
            }
            obj = abeExtend.hooks.instance.trigger('beforeSave', obj)

            var page = new Page(obj.json.content.abe_meta.template, templatesTexts[jsonObject.abe_meta.template], obj.json.content, true)
            cmsOperations.save.saveHtml(
              path.join(config.root, pConfig.ABE_DESTINATION, jsonObject.abe_meta.link),
              page.html
            )
            
            obj = abeExtend.hooks.instance.trigger('afterSave', obj)

            traceLog('('+(moment(moment() - dateStart).format('mm:ss')) + 'sec) ' + i + ' - ' + pub.path.replace(config.root, '').replace(config.data.url, '') + ' (tpl: ' + jsonObject.abe_meta.template + ')')
            resolve()
          },
          () => {
            errorLog('publish-all ERROR on ' + pub.path.replace(config.root, '').replace(config.data.url, ''))
            resolve()
          })
      })
    }
  
    p.then(function () {
      publishNext(published, tt, cb, i++)
    })
    .catch(function (e) {
      publishNext(published, tt, cb, i++)
      errorLog('error', e)
    })
  }else {
    cb(i)
  }
}

function startProcess() {
  dateStart = moment()
  log('start publish all at path ' + pConfig.ABE_PATH);
  log('searching for file at ' + config.root);
  var files = Manager.instance.getListWithStatusOnFolder('publish', pConfig.ABE_PATH)

  log('Found ' + files.length + ' to republish')

  publishNext(files, files.length, function (i) {
    log('total ' + i + ' files')
    if (publishErrors.length > 0) {
      errorLog('Errors ' + publishErrors.length + ' see ' + errorPath + ' for more info')
      fse.writeJsonSync(errorPath, publishErrors, {
        space: 2,
        encoding: 'utf-8'
      })
    }
    log('publish process finished ' + (moment(moment() - dateStart).format('mm:ss')) + 'sec')
    process.exit(0)
  })
}

var publishErrors = []
// var logsPub = ""
if(typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  var config = require('../../cli').config
  if(pConfig.ABE_WEBSITE) config.set({root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/'})
  try {
    // IMPORT LIB
    var Page = require('../../cli').Page
    var cmsOperations = require('../../cli').cmsOperations
    var abeExtend = require('../../cli').abeExtend
    var Manager = require('../../cli').Manager
    var cmsData = require('../../cli').cmsData
    var cmsTemplates = require('../../cli').cmsTemplates
    var Handlebars = require('../../cli').Handlebars

    abeExtend.hooks.instance.trigger('afterHandlebarsHelpers', Handlebars)
    Manager.instance.init()
      .then(startProcess)
      .catch((e) => {
        errorLog('publish-all' + e)
      })

  } catch(e) {
    errorLog('publish-all' + e)
  }

}else {
  errorLog('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website')
  process.exit(0)
}