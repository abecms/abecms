import fs from 'fs-extra'
import path from 'path'
import pkg from '../../../package'

import {Manager, cmsStructure, coreUtils, config, Handlebars} from '../../cli'

/**
 * This route returns the structure as HTML
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var route = async function(req, res) {
  var manager = {}
  manager.home = {files: []}
  manager.list = Manager.instance.getStructureAndTemplates()
  manager.config = JSON.stringify(config)

  var isHome = true
  var jsonPath = null
  var linkPath = null
  var template = null
  var fileName = null
  var folderPath = null
  var structure = Manager.instance.getStructureAndTemplates().structure

  var s2 = await cmsStructure.structure.list(Manager.instance.pathStructure)

  structure = JSON.stringify(structure).replace(
    new RegExp(config.root, 'g'),
    ''
  )

  var EditorVariables = {
    user: res.user,
    slugs: Manager.instance.getSlugs(),
    abeUrl: '/abe/editor/',
    Locales: coreUtils.locales.instance.i18n,
    manager: manager,
    config: config,
    structure: structure,
    s2: JSON.stringify(s2),
    isStructure: true,
    abeVersion: pkg.version
  }
  res.render('../views/structure.html', EditorVariables)
}

export default route
