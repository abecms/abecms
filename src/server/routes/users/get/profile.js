import pkg from '../../../../../package'
import fs from 'fs-extra'
import path from 'path'

import {coreUtils, config, Handlebars, User} from '../../../../cli'

var route = function route(req, res) {
  var resHtml = ''

  var page = path.join(__dirname + '/../../../views/users/profile.html')
  if (coreUtils.file.exist(page)) {
    resHtml = fs.readFileSync(page, 'utf8')
  }

  var template = Handlebars.compile(resHtml, {noEscape: true})

  var userEditable = JSON.parse(JSON.stringify(res.user))
  delete userEditable.password
  delete userEditable.role
  delete userEditable.id
  delete userEditable.actif

  var tmp = template({
    csrfToken: res.locals.csrfToken,
    config: config,
    userEditable: userEditable,
    express: {
      req: req,
      res: res
    },
    info: req.flash('info'),
    error: req.flash('error'),
    isProfile: true,
    user: res.user,
    manager: {
      config: JSON.stringify(config)
    },
    abeVersion: pkg.version
  })

  return res.send(tmp)
}

export default route
