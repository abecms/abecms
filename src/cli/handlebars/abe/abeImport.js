import Handlebars from 'handlebars'
import fse from 'fs-extra'
import path from 'path'

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
    var defaultPartials = `${__dirname.replace(/\/$/,'')}/${config.defaultPartials.replace(/\/$/,'')}`
    var custom = (config.custom !== '') ? `${config.root.replace(/\/$/,'')}/${config.custom.replace(/\/$/,'')}` : defaultPartials
    var pathToPartial = `${custom}/${file}.html`
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
        var checkFile = path.join(pluginPartials, `${file}.html`)
        if (fileUtils.isFile(checkFile)) {
            html += fse.readFileSync(checkFile, 'utf8')
        }
    })
    html = Hooks.instance.trigger('afterImport', html, file, config, ctx)

    var template = Handlebars.compile(html)
    var res = new Handlebars.SafeString(template(ctx, {data: {intl: intlData}}))

    return res
}
