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
  if(typeof req.query.token !== 'undefined' && req.query.token !== null) {
    User.utils.findByResetPasswordToken(req.query.token, function () {

      var page = path.join(__dirname + '/../../../views/users/reset.html')
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
        token: req.query.token,
        info: req.flash('info')
      })

      return res.send(tmp)
    })
  }else {
    res.redirect('/abe/users/forgot')
  }
}

export default route