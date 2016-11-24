import fs from 'fs-extra'
import path from 'path'

import {
  coreUtils,
  config,
  Handlebars,
  User
} from '../../../../cli'

var route = function route(req, res) {
  var resHtml = ''

  var page = path.join(__dirname + '/../../../views/users/users-list.html')
  if (coreUtils.file.exist(page)) {
    resHtml = fs.readFileSync(page, 'utf8')
  }
  
  var template = Handlebars.compile(resHtml, {noEscape: true})

  var roles = config.users.roles
  var tmp = template({
    users: User.getAll(),
    user: res.user,
    config: JSON.stringify(config),
    roles: roles
  })
  
  return res.send(tmp)
}

export default route