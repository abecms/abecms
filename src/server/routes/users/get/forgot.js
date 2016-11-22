'use strict';

import fs from 'fs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import path from 'path'

import {
  coreUtils,
  config,
  Handlebars,
  User
} from '../../../../cli'

var route = function route(req, res, next) {

  if(typeof req.query.email !== 'undefined' && req.query.email !== null) {
    User.findByEmail(req.query.email, function (err, user) {
      if (err) {
        return res.status(200).json({success: 1}); 
      }

      crypto.randomBytes(20, function(err, buf) {
        var resetPasswordToken = buf.toString('hex');
        var forgotExpire = config.forgotExpire;

        User.update({
          id:user.id,
          resetPasswordToken: resetPasswordToken,
          resetPasswordExpires: Date.now() + (forgotExpire*60*1000)
        });

        var requestedUrl = req.protocol + '://' + req.get('Host') + '/abe/users/reset?token=' + resetPasswordToken;

        var smtp = config.smtp;
        var emailConf = config.email;
        var html = emailConf.html || ''

        if(typeof emailConf.templateHtml !== 'undefined' && emailConf.templateHtml !== null) {
          var fileHtml = path.join(config.root, emailConf.templateHtml)
          if (coreUtils.file.exist(fileHtml)) {
            var html = fs.readFileSync(fileHtml, 'utf8')
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

        if(typeof smtp === 'undefined' || smtp === null) {
          var transport = nodemailer.createTransport('direct', {});
          transport.sendMail({
              from: emailConf.from, // sender address
              to: user.email, // list of receivers
              subject: emailConf.subject, // Subject line
              text: emailConf.text.replace(/\{\{forgotUrl\}\}/g, requestedUrl), // plaintext body
              html: html.replace(/\{\{forgotUrl\}\}/g, requestedUrl) // html body
          }, console.error);

          var reset = path.join(__dirname + '/../../partials/forgot.html')
          var html = coreUtils.file.getContent(reset);

          var template = Handlebars.compile(html, {noEscape: true})

          var tmp = template({
            csrfToken: res.locals.csrfToken,
            config: JSON.stringify(config),
            express: {
              req: req,
              res: res
            },
            token: req.query.token,
            info: 'Check your inbox'
          })

          return res.send(tmp);
        }else if(typeof smtp !== 'string') {
          // create reusable transporter object using the default SMTP transport
          var transporter = nodemailer.createTransport("SMTP", smtp)

          // setup e-mail data with unicode symbols
          var mailOptions = {
              from: emailConf.from, // sender address
              to: user.email, // list of receivers
              subject: emailConf.subject, // Subject line
              text: emailConf.text.replace(/\{\{forgotUrl\}\}/g, requestedUrl), // plaintext body
              html: html.replace(/\{\{forgotUrl\}\}/g, requestedUrl) // html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                  return console.log(error);
              }

              var reset = path.join(__dirname + '/../../partials/forgot.html')
              var html = coreUtils.file.getContent(reset);

              var template = Handlebars.compile(html, {noEscape: true})

              var tmp = template({
                csrfToken: res.locals.csrfToken,
                config: JSON.stringify(config),
                express: {
                  req: req,
                  res: res
                },
                token: req.query.token,
                info: 'Check your inbox'
              })

              return res.send(tmp);
              console.log('Message sent: ' + info.response);
          });
        }
      });
    });
  }else {
    var reset = path.join(__dirname + '/../../partials/forgot.html')
    var html = coreUtils.file.getContent(reset);

    var template = Handlebars.compile(html, {noEscape: true})

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

    return res.send(tmp);
  }
}

export default route