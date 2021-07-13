import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'

import {coreUtils, abeExtend} from '../../../'

export default function abeImport(file, config, ctx) {

  file = abeExtend.hooks.instance.trigger('beforeImport', file, config, ctx)

  var html = ''

  // config de Abe
  config = JSON.parse(config)

  // le path vers les locales
  let intlData = config.intlData

  // le path vers partials
  var defaultPartials = `${__dirname.replace(
    /\/$/,
    ''
  )}/${config.defaultPartials.replace(/\/$/, '')}`

  // si config.custom pas vide, on rajoute ce path to custom
  var custom =
    config.custom !== ''
      ? `${config.root.replace(/\/$/, '')}/${config.custom.replace(/\/$/, '')}`
      : defaultPartials
  var pathToPartial = `${custom}/${file}.html`

  // Je cherche d'abord dans custom puis partials
  // pour récupérer le template
  try {
    fs.statSync(pathToPartial)
  } catch (e) {
    pathToPartial = `${defaultPartials}/${file}.html`
  }
  if (coreUtils.file.exist(pathToPartial)) {
    html = fs.readFileSync(pathToPartial, 'utf8')
  }

  // je recherche les customs de plugins. Si je trouve le fichier aussi dans l'un de ces paths,
  // je rajoute le contenu au html deja obtenu
  var pluginsCustoms = abeExtend.plugins.instance.getCustoms()
  Array.prototype.forEach.call(pluginsCustoms, pluginCustom => {
    var checkFile = path.join(pluginCustom, `${file}.html`)
    if (coreUtils.file.exist(checkFile)) {
      html += fs.readFileSync(checkFile, 'utf8')
    }
  })

  // Je fais pareil avec le path des partials des plugins
  var pluginsPartials = abeExtend.plugins.instance.getPartials()
  Array.prototype.forEach.call(pluginsPartials, pluginPartials => {
    var checkFile = path.join(pluginPartials, `${file}.html`)
    if (coreUtils.file.exist(checkFile)) {
      html += fs.readFileSync(checkFile, 'utf8')
    }
  })

  html = abeExtend.hooks.instance.trigger(
    'afterImport',
    html,
    file,
    config,
    ctx
  )

  // Et je finis par compiler le template !!!!
  var template = Handlebars.compile(html)
  var res = new Handlebars.SafeString(template(ctx, {data: {intl: intlData}}))

  return res
}
