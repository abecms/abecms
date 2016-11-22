import fs from 'fs-extra'
import Cookies from 'cookies'
import jwt from 'jwt-simple'
import crypto from 'crypto'
import path from 'path'

import {
  coreUtils,
  Handlebars,
  config,
  User
} from '../../../../cli'

var route = function(req, res, next) {
  var resHtml = ""
  if(typeof req.body.token !== 'undefined' && req.body.token !== null
    && typeof req.body.password !== 'undefined' && req.body.password !== null
    && typeof req.body['repeat-password'] !== 'undefined' && req.body['repeat-password'] !== null) {
    if (req.body.password !== req.body['repeat-password']) {

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
        token: req.body.token,
        info: 'Emails are not the same'
      })

      return res.send(tmp);
    }
    User.findByResetPasswordToken(req.body.token, function (err, userToReset) {
      var msg = ''
      var forgotExpire = config.users.forgotExpire
      if (err) {
        msg = 'Error'
      }else if (typeof userToReset === 'undefined' || userToReset === null) {
        msg = 'Invalid token'
      }else {
        var d = new Date().getTime()
        d = (((d - userToReset.resetPasswordExpires) / 1000) / 60)
        if (d > 0) {
          msg = 'Token expired'
        }
      }
      if (msg !== '') {

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
          token: req.body.token,
          info: msg
        })

        return res.send(tmp);
      }

      userToReset.password = req.body.password
      var resUpdatePassword = User.updatePassword(userToReset, req.body.password)
      if (resUpdatePassword.success === 1) {
        var login = config.users.login
        res.redirect(login)
      }else {
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
          token: req.body.token,
          info: resUpdatePassword.message
        })

        return res.send(tmp);
      }
    });
  }else if(typeof req.body.token !== 'undefined' && req.body.token !== null) {
    res.redirect('/abe/users/reset?token=' + req.body.token)
  }else {
    res.redirect('/abe/users/forgot')
  }
}

export default route