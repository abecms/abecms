import fs from 'fs-extra'
import path from 'path'

import {
	Manager,
  coreUtils,
  config,
  Handlebars
} from '../../cli'

var route = function(req, res){
  var resHtml = ''

  var page = path.join(__dirname + '/../views/list-structure.html')
  if (coreUtils.file.exist(page)) {
    resHtml = fs.readFileSync(page, 'utf8')
  }
  
  var structure = Manager.instance.getStructureAndTemplates().structure
  structure = JSON.stringify(structure).replace(new RegExp(config.root, 'g'), '')
  var template = Handlebars.compile(resHtml, {noEscape: true})
  var tmp = template({
    config: JSON.stringify(config),
    structure: structure
  })
  return res.send(tmp)
}

export default route
