import fs from 'fs-extra'
import path from 'path'
import flash from 'connect-flash'

import {
  coreUtils,
  config,
  Handlebars
} from '../../../../cli'

var route = function route(req, res, next) {
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
  console.log('call login url', req.url)
  var resHtml = '';

  var page = path.join(__dirname + '/../../../views/users/login.html')
  if (coreUtils.file.exist(page)) {
    resHtml = fs.readFileSync(page, 'utf8')
  }
  
  var template = Handlebars.compile(resHtml, {noEscape: true})
  
  var tmp = template({
    csrfToken: res.locals.csrfToken,
    config: JSON.stringify(config),
    express: {
      req: req,
      res: res
    },
    info: req.flash('info')
  })

  return res.send(tmp);
}

export default route