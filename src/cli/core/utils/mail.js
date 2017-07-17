import nodemailer from 'nodemailer'
import {config} from '../../'

export const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i

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

  if (
    typeof smtp === 'undefined' ||
    smtp === null ||
    typeof smtp === 'string'
  ) {
    transporter = nodemailer.createTransport({
      name: 'localhost',
      direct: true
    })
  } else {
    service = smtp.service.toLowerCase()
    options = smtp.options
    if (service === 'ses') {
      transporter = nodemailer.createTransport(options)
    } else if (service === 'mandrill' || service === 'mailchimp') {
      transport = require('nodemailer-mandrill-transport')
      transporter = nodemailer.createTransport(transport(options))
    } else if (service === 'mailgun') {
      transport = require('nodemailer-mailgun-transport')
      transporter = nodemailer.createTransport(transport(options))
    } else if (service === 'sendgrid') {
      transport = require('nodemailer-sendgrid-transport')
      transporter = nodemailer.createTransport(transport(options))
    } else {
      transport = require(service)
      transporter = nodemailer.createTransport(transport(options))
    }
  }

  transporter.sendMail(mail, function(error, info) {
    if (error) {
      return console.log(error)
    }
  })
}
