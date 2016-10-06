import fse from 'fs-extra'
import {saveHtml} from './cms/operations/save'
import path from 'path'

import {
  cmsData,
  FileParser,
  config,
  fileUtils,
  fileAttr,
  cmsTemplate,
  Page
} from './'

class Builder {

  constructor(root, folder, dest, flow){
    this.pathToJson = path.join(root, config.data.url)
    var files = fileAttr.filterLatestVersion(FileParser.getFiles(this.pathToJson, config.data.url), flow)

    if(flow === 'publish') {
      files = FileParser.getFiles(path.join(root, config.publish.url), new RegExp('.' + config.files.templates.extension))
    }

    var build = function (index) {
      var file = files[index]
      if(file.path.indexOf('.' + config.files.templates.extension) > -1){
        file.path = file.path.replace(config.publish.url, config.data.url)
                             .replace('.' + config.files.templates.extension, '.json')
        
        var json = fse.readJsonSync(file.path)
        var text = cmsTemplate.template.getTemplate(json.abe_meta.template)
        
        cmsData.source.getDataList(fileUtils.removeLast(json.abe_meta.link), text, json)
          .then(() => {
            var page = new Page(json.abe_meta.template, text, json, true)
            saveHtml(path.join(root, dest + json.abe_meta.link), page.html)
            if(files[index + 1]) build(index + 1)
          }).catch(function(e) {
            console.error(e)
            if(files[index + 1]) build(index + 1)
          })
      }
      else if(file.path.indexOf('.json') > -1){
        var json = fse.readJsonSync(file.path)
        var text = cmsTemplate.template.getTemplate(json.abe_meta.template)

        cmsData.source.getDataList(fileUtils.removeLast(json.abe_meta.link), text, json)
          .then(() => {
            var page = new Page(json.abe_meta.template, text, json, true)
            saveHtml(path.join(root, dest + json.abe_meta.link), page.html)
            if(files[index + 1]) build(index + 1)
          }).catch(function(e) {
            console.error(e)
            if(files[index + 1]) build(index + 1)
          })
      }
      else if(files[index + 1]) build(index + 1)
    }

    build(0)

  }

}

if(process.env.ROOT && process.env.FOLDER && process.env.DEST){
  config.set({root: process.env.ROOT})
  var dest = process.env.DEST || 'tmp'
  var flow = process.env.FLOW || 'draft'
  new Builder(process.env.ROOT, process.env.FOLDER, dest, flow)
}
