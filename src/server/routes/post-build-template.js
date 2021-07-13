import path from 'path'
import mkdirp from 'mkdirp'
import fs from 'fs'
import {config, coreUtils, cmsData, Manager} from '../../cli'

var route = function(req, res) {
  if (typeof res._header !== 'undefined' && res._header !== null) return

  if (req.body.name != null) {
    console.log(req.body.name, req.body.partials)

    let partialsAr = req.body.partials.split(',')
    let partials = ''
    partialsAr.map(function(elt, index){
      partials += '{{abe type="import" file="' + elt.replace('.png', '.html').replace(/^\/+/g, '') + '"}}\n'
    })
    let file = path.join(Manager.instance.pathTemplates,'/layout.' + config.files.templates.extension)
    let saveFile = path.join(Manager.instance.pathTemplates, '/' + req.body.name + '.' + config.files.templates.extension)
    if (coreUtils.file.exist(file)) {
      let text = fs.readFileSync(file, 'utf8')
      let regions = cmsData.regex.getTagAbeWithType(text, 'region')
      if (regions.length > 0) {
        let obj = cmsData.attributes.getAll(regions[0], {})
        console.log(obj.key)
        text = text.replace(regions[0], partials)
      }
      mkdirp.sync(path.dirname(saveFile))
      fs.writeFileSync(saveFile, text)
    }
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({success: 1}))
}

export default route
