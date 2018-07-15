import fs from 'fs-extra'
import path from 'path'
import pkg from '../../../package'

import {Manager, coreUtils, config, Handlebars, cmsThemes} from '../../cli'
import { all } from 'bluebird';

/**
 * This route returns the references files in HTML format
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var route = function(req, res) {
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

  var EditorVariables = {
    user: res.user,
    slugs: Manager.instance.getSlugs(),
    abeUrl: '/abe/themes/',
    Locales: coreUtils.locales.instance.i18n,
    manager: manager,
    config: config,
    reference: Manager.instance.getReferences(),
    isBuildTemplate: true,
    abeVersion: pkg.version
  }

  let allFiles = []
  coreUtils.file.getFilesAsync(Manager.instance.pathPartials, true, '.png')
  .then(function(files) {
    files.forEach(function(pathPartial, index){
      allFiles = allFiles.concat(pathPartial.replace(Manager.instance.pathPartials, ''))
    })
    EditorVariables['partials'] = allFiles
    res.render('../views/build-template.html', EditorVariables)
  })
}

export default route
