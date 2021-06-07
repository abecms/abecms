import path from 'path'
import fse from 'fs-extra'
import {
  init,
  log,
  trace,
  error,
  processConfig,
  getTime
} from './initAbeForProcesses'

// IMPORT LIB
var Page = require('../../cli').Page
var cmsOperations = require('../../cli').cmsOperations
var abeExtend = require('../../cli').abeExtend
var Manager = require('../../cli').Manager
var cmsData = require('../../cli').cmsData
var cmsTemplates = require('../../cli').cmsTemplates
var config = require('../../cli').config
var templatesTexts = {}

async function publishNext(files, tt, cb, i = 0) {
  var pub = files.shift()
  if (typeof pub !== 'undefined' && pub !== null) {
    // process.send is only defined in a child process
    if (typeof process.send === 'function') {
      process.send(
        JSON.stringify({
          percent: Math.round((i + 1) * 100 / tt * 100) / 100,
          time: getTime()
        })
      )
    }

    var jsonObject = await fse.readJson(pub[processConfig.ABE_STATUS].path)
    i++
    if (
      typeof templatesTexts[jsonObject.abe_meta.template] === 'undefined' ||
      templatesTexts[jsonObject.abe_meta.template] === null
    ) {
      templatesTexts[
        jsonObject.abe_meta.template
      ] = cmsTemplates.template.getTemplate(
        jsonObject.abe_meta.template,
        jsonObject
      )
    }

    await cmsData.source.updateJsonWithExternalData(templatesTexts[jsonObject.abe_meta.template], jsonObject)

    jsonObject = abeExtend.hooks.instance.trigger(
      'afterupdateJsonWithExternalDataOnSave',
      jsonObject
    )

    // removing each blocks potentially containing abe data type then updating the source
    // ie. You have a reference file in an abe data type source and you update this reference file
    // then it triggers a generate-posts to rebuild the posts and update the content with these
    // new data
    var textTmp = templatesTexts[jsonObject.abe_meta.template].replace(
      cmsData.regex.eachBlockPattern,
      ''
    )

    const matches = cmsData.regex.getAbeTypeDataList(textTmp)
    Array.prototype.forEach.call(matches, match => {
      var obj = cmsData.attributes.getAll(match, jsonObject)

      if (!obj.editable) {
        jsonObject[obj.key] = obj.source
      }
    })

    var obj = {
      publishAll: true,
      type: jsonObject.abe_meta.status,
      json: {
        content: jsonObject
      }
    }

    var page = new Page(
      templatesTexts[jsonObject.abe_meta.template],
      obj.json.content,
      true
    )

    cmsOperations.save.saveHtml(
      path.join(
        config.root,
        processConfig.ABE_DESTINATION,
        jsonObject.abe_meta.link
      ),
      page.html
    )

    // are there additional templates to export?
    if (obj.json.content.abe_meta.relatedTemplates) {
      const relatedTemplates = Object.keys(obj.json.content.abe_meta.relatedTemplates)
      await Promise.all(relatedTemplates.map(async (key, index) => {
        const relatedTemplate =
          obj.json.content.abe_meta.relatedTemplates[key]

        if (relatedTemplate.template && relatedTemplate.path) {
          const relTemplate = cmsTemplates.template.getTemplate(
            relatedTemplate.template,
            obj.json.content
          )
          let extension = config.files.templates.extension
          if (relatedTemplate.extension)
            extension = relatedTemplate.extension
          const fileName =
            path.basename(
              obj.json.content.abe_meta.link,
              '.' + config.files.templates.extension
            ) +
            '.' +
            extension
          const relPath = path.join(
            config.root,
            processConfig.ABE_DESTINATION,
            relatedTemplate.path,
            fileName
          )

          await cmsData.source.updateJsonWithExternalData(relTemplate, obj.json.content)
          const page = new Page(relTemplate, obj.json.content, true)
          cmsOperations.save.saveHtml(relPath, page.html)
        }
      }))
    }

    obj = abeExtend.hooks.instance.trigger('afterSave', obj)

    trace(
      '(' +
        getTime() +
        ') ' +
        i +
        ' - ' +
        pub[processConfig.ABE_STATUS].path.replace(
          Manager.instance.pathData,
          ''
        ) +
        ' (tpl: ' +
        jsonObject.abe_meta.template +
        ')'
    )

    await publishNext(files, tt, cb, i++)
  } else {
    cb(i)
  }
}

async function startProcess() {
  log(`start publishing all files in directory ${processConfig.ABE_PATH}`)
  log(`searching for file in ${config.root}`)
  log(`searcing status: ${processConfig.ABE_STATUS}`)
  log(`save to: ${path.join(config.root, processConfig.ABE_DESTINATION)}`)
  var files = Manager.instance.getListWithStatusOnFolder(
    processConfig.ABE_STATUS,
    processConfig.ABE_PATH
  )

  log('Found ' + files.length + ' to republish')

  await publishNext(files, files.length, function(i) {
    log('total ' + i + ' files')
    log('publish process finished ' + getTime())
    if (typeof process.send === 'function') {
      process.send(JSON.stringify({msg: 'exit'}))
    }
    process.exit(0)
  })
}

init('generate-posts', {
  ABE_STATUS: 'publish',
  ABE_PATH: '',
  ABE_DESTINATION: 'site'
}).then(startProcess, msg => {
  if (typeof process.send === 'function') {
    process.send(JSON.stringify({msg: 'exit'}))
  }
  error(msg)
  process.exit(0)
})
