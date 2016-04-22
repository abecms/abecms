import Handlebars from 'handlebars'
import fse from 'fs-extra'

import {
  Plugins
  ,fileUtils
  ,config
  ,Hooks
} from '../../'

export default function abeImport (file, config, ctx) {
  file = Hooks.instance.trigger('beforeImport', file, config, ctx)

  var config = JSON.parse(config)
  let intlData = config.intlData
  var defaultPartials = `${__dirname.replace(/\/$/,"")}/${config.defaultPartials.replace(/\/$/,"")}`
  var partials = (config.partials !== '') ? `${config.root.replace(/\/$/,"")}/${config.partials.replace(/\/$/,"")}` : defaultPartials
  var pathToPartial = `${partials}/${file}.html`
  try{
    var stat = fse.statSync(pathToPartial)
  }
  catch(e){
    var pathToPartial = `${defaultPartials}/${file}.html`
  }
  if (fileUtils.isFile(pathToPartial)) {
    var html = fse.readFileSync(pathToPartial, 'utf8')
  }else {
    html = ''
  }

  var pluginsPartials = Plugins.instance.getPartials()
  Array.prototype.forEach.call(pluginsPartials, (pluginPartials) => {
    var checkFile = fileUtils.concatPath(pluginPartials, `${file}.html`)
    if (fileUtils.isFile(checkFile)) {
      html += fse.readFileSync(checkFile, 'utf8')
    }
  })
  var template = Handlebars.compile(html)
  var res = new Handlebars.SafeString(template(ctx, {data: {intl: intlData}}))

  res = Hooks.instance.trigger('afterImport', res, file, config, ctx)

  return res
}
