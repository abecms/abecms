'use strict';

var config = require('../../modules/config')
  , User = require('../../modules/User')
  , fs = require('fs')
  , Cookies = require('cookies')
  , jwt = require('jwt-simple')
  , crypto = require('crypto');
var path = require('path');

var route = function route(req, res, next, abe) {
  if(typeof req.body.token !== 'undefined' && req.body.token !== null
    && typeof req.body.password !== 'undefined' && req.body.password !== null
    && typeof req.body['repeat-password'] !== 'undefined' && req.body['repeat-password'] !== null) {
    if (req.body.password !== req.body['repeat-password']) {
      var reset = path.join(__dirname + '/../../partials/reset.html')
      var html = abe.coreUtils.file.getContent(reset);

      var template = abe.Handlebars.compile(html, {noEscape: true})

      var tmp = template({
        csrfToken: res.locals.csrfToken,
        config: JSON.stringify(abe.config),
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
      var forgotExpire = config.getConfig('forgotExpire', abe);
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
        var reset = path.join(__dirname + '/../../partials/reset.html')
        var html = abe.coreUtils.file.getContent(reset);

        var template = abe.Handlebars.compile(html, {noEscape: true})

        var tmp = template({
          csrfToken: res.locals.csrfToken,
          config: JSON.stringify(abe.config),
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
      var resUpdatePassword = User.updatePassword(userToReset, req.body.password, abe)
      if (resUpdatePassword.success === 1) {
        var login = config.getConfig('login', abe);
        res.redirect(login)
      }else {
        var reset = path.join(__dirname + '/../../partials/reset.html')
        var html = abe.coreUtils.file.getContent(reset);

        var template = abe.Handlebars.compile(html, {noEscape: true})

        var tmp = template({
          csrfToken: res.locals.csrfToken,
          config: JSON.stringify(abe.config),
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
    res.redirect('/abe/plugin/abe-users/reset?token=' + req.body.token)
  }else {
    res.redirect('/abe/plugin/abe-users/forgot')
  }
}

exports.default = route