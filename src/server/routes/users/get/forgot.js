import fs from 'fs-extra'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import path from 'path'

import {coreUtils, config, Handlebars, User} from '../../../../cli'

function showHtml(res, req, info) {
  var resHtml = ''
  var page = path.join(__dirname + '/../../../views/users/forgot.html')
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
    info: info
  })

  return res.send(tmp)
}

var route = function route(req, res) {
  var html
  if (typeof req.query.email !== 'undefined' && req.query.email !== null) {
    User.utils.findByEmail(req.query.email, function(err, user) {
      if (err) {
        return res.status(200).json({success: 1})
      }
      
      if (!user) {
        return showHtml(res, req, 'Email not found')
      }

      crypto.randomBytes(20, function(err, buf) {
        var resetPasswordToken = buf.toString('hex')
        var forgotExpire = config.forgotExpire

        User.operations.update({
          id: user.id,
          resetPasswordToken: resetPasswordToken,
          resetPasswordExpires: Date.now() + forgotExpire * 60 * 1000
        })

        var requestedUrl =
          req.protocol +
          '://' +
          req.get('Host') +
          '/abe/users/reset?token=' +
          resetPasswordToken

        var emailConf = config.users.email
        html = emailConf.html || ''

        if (
          typeof emailConf.templateHtml !== 'undefined' &&
          emailConf.templateHtml !== null
        ) {
          var fileHtml = path.join(config.root, emailConf.templateHtml)
          if (coreUtils.file.exist(fileHtml)) {
            html = fs.readFileSync(fileHtml, 'utf8')
          }
        }

        var template = Handlebars.compile(html, {noEscape: true})

        html = template({
          express: {
            req: req,
            res: res
          },
          forgotUrl: requestedUrl,
          siteUrl: req.protocol + '://' + req.get('Host'),
          user: user
        })

        var from = emailConf.from
        var to = user.email
        var subject = emailConf.subject
        var text = emailConf.text.replace(/\{\{forgotUrl\}\}/g, requestedUrl)
        var html = html.replace(/\{\{forgotUrl\}\}/g, requestedUrl)

        coreUtils.mail.send(from, to, subject, text, html)
        showHtml(res, req, 'Check your inbox')
      })
    })
  } else {
    showHtml(res, req, req.flash('info'))
  }
}

export default route
