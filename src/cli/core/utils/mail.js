import nodemailer from 'nodemailer'
import {config} from '../../'

/**
 * This function will send mails thanks to data/templates merged with Abe
 * @param  {[type]} from         [description]
 * @param  {[type]} to           [description]
 * @param  {[type]} subject      [description]
 * @param  {[type]} data         [description]
 * @param  {[type]} textTemplate [description]
 * @param  {[type]} htmlTemplate [description]
 * @return {[type]}              [description]
 */
export function send(from, to, subject, text = '', html = '') {
  const smtp = config.smtp
  let service
  let transport
  let options
  let transporter

  let mail = {
    from: from,
    to: to, // list of receivers
    subject: subject,
    text: text,
    html: html
  }

  if(typeof smtp === 'undefined' || smtp === null || typeof smtp === 'string') {
    transporter = nodemailer.createTransport({
      name: 'localhost',
      direct: true
    })
  } else{
    service = smtp.service.toLowerCase()
    options = smtp.options
    if(service === 'ses'){
      transporter = nodemailer.createTransport(options)
    } else if(service === 'mandrill' || service === 'mailchimp') {
      transport = require('nodemailer-mandrill-transport')
      transporter = nodemailer.createTransport(transport(options))
    } else if(service === 'mailgun') {
      transport = require('nodemailer-mailgun-transport')
      transporter = nodemailer.createTransport(transport(options))
    } else if(service === 'sendgrid') {
      transport = require('nodemailer-sendgrid-transport')
      transporter = nodemailer.createTransport(transport(options))
    } else {
      transport = require(service)
      transporter = nodemailer.createTransport(transport(options))
    }
  }

  transporter.sendMail(mail, function(error, info){
    if(error){
      return console.log(error)
    }
  })
}
