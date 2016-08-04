import express from 'express'
import fs from 'fs'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import {minify} from 'html-minifier'
import extend from 'extend'
import * as abe from '../../cli'
import xss from 'xss'
import pkg from '../../../package'

import {
  fileAttr,
  save,
  getAttr, getEnclosingTags, escapeTextToRegex,
  Util,
  FileParser,
  fileUtils,
  folderUtils,
  config,
  cli,
  log,
  Page,
  Locales,
  abeProcess,
  getTemplate,
  Hooks,
  Plugins,
  Handlebars,
  cleanSlug
} from '../../cli'

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'
import pageHelper from '../helpers/page'

var route = function(req, res, next){
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var resp = {success: 1}
  var filePath
  var fstream
  var folderWebPath = '/' + config.upload.image
  folderWebPath = Hooks.instance.trigger('beforeSaveImage', folderWebPath, req)
  var folderFilePath = fileUtils.concatPath(config.root, config.publish.url, folderWebPath)
  mkdirp.sync(folderFilePath)
  req.pipe(req.busboy)
  var size = 0
  var hasError = false
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var ext = filename.split('.')
    ext = ext[ext.length - 1].toLowerCase()
    file.fileRead = []

    var returnErr = function (msg) {
      file.resume()
      hasError = true
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify({error: 1, response: msg}))
    }

    file.on('limit', function() {
      req.unpipe(req.busboy)
      returnErr('file to big')
    })

    file.on('data', function(chunk) {
      file.fileRead.push(chunk)
    });

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png' && mimetype !== 'image/svg+xml') {
      returnErr('unauthorized file')
    } else if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png' && ext !== 'svg') {
      returnErr('not an image')
    }

    file.on('end', function() {
      if(hasError) return
      var ext = filename.split('.')
      ext = ext[ext.length - 1]
      var randID = '-' + (((1+Math.random())*0x100000)|0).toString(16).substring(2)
      var cleanFileName = cleanSlug(filename).replace(`.${config.files.templates.extension}`, `${randID}.${ext}`)
      // var sfStat = fs.statSync(abe.fileUtils.concatPath(abe.config.root, abe.config.publish.url, path));

      filePath = fileUtils.concatPath(folderFilePath, cleanFileName)
      var createImage = function () {
        try{
          var sfStat = fs.statSync(filePath)

          if(sfStat){
            var nb = filePath.match(/_([0-9]).(jpg|png|gif|svg)/)
            if(nb && nb[1]) filePath = filePath.replace(/_([0-9])\.(jpg|png|gif|svg)/, `_${parseInt(nb[1]) + 1}.$2`)
            else filePath = filePath.replace(/\.(jpg|png|gif|svg)/, `_1.$1`)
            createImage()
          }
        }
        catch(e){
          resp['filePath'] = fileUtils.concatPath(folderWebPath, cleanFileName)
          fstream = fs.createWriteStream(filePath)
          for (var i = 0; i < file.fileRead.length; i++) {
            fstream.write(file.fileRead[i])
          }
          fstream.on('close', function () {})
        }
      }

      createImage()
    })
  })
  req.busboy.on('finish', function() {
    if(hasError) return
    resp = Hooks.instance.trigger('afterSaveImage', resp, req)
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(resp))
  });
}

export default route