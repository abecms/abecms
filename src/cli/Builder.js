import fse from 'fs-extra'
import extend from 'extend'
import mkdirp from 'mkdirp'
import {saveHtml} from './controllers/Save'

import {
  Util,
  FileParser,
  config,
  fileUtils,
  fileAttr,
  cli,
  log,
  getTemplate,
  Page
} from './'

class Builder {

  constructor(root, folder, dest, flow){
    this.pathToJson = fileUtils.concatPath(root, config.data.url)
    var files = fileAttr.filterLatestVersion(FileParser.getFiles(this.pathToJson, config.data.url), flow)
    files.forEach(function (file) {
      var json = fse.readJsonSync(file.path)
      var text = getTemplate(json.abe_meta.template)
      Util.getDataList(fileUtils.removeLast(json.abe_meta.link), text, json)
      .then(() => {
        var page = new Page(json.abe_meta.link, text, json, true)
        saveHtml(fileUtils.concatPath(root, dest + json.abe_meta.link), page.html)
        console.log(fileUtils.concatPath(root, dest + json.abe_meta.link))
      }).catch(function(e) {
        console.error(e.stack)
      })
    })
  }

}

if(process.env.ROOT && process.env.FOLDER && process.env.DEST){
  config.set({root: process.env.ROOT})
  var dest = process.env.DEST || 'tmp'
  var flow = process.env.FLOW || 'draft'
  new Builder(process.env.ROOT, process.env.FOLDER, dest, flow)
}