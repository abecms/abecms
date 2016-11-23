import fs from 'fs-extra'
import Cookies from 'cookies'
import jwt from 'jwt-simple'
import path from 'path'

import {
  abeExtend,
  coreUtils,
  config,
  Handlebars,
  User
} from '../../../../cli'

var route = function route(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next);
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var resHtml = '';

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
  
  return res.send(tmp);
}

export default route