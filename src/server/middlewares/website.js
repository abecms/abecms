import path from 'path'
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
  Util,
  FileParser,
  fileUtils,
  folderUtils,
  config,
  Page,
  abeProcess,
  Hooks,
  Plugins,
  Handlebars
} from '../../cli'

import locale from '../helpers/abe-locale'

var middleware = function(req, res, next) {
  if (req.originalUrl.indexOf('/abe/') > -1 || req.originalUrl.indexOf('/plugin/') > -1) {
    return next()
  }

  if (req.originalUrl === '' || req.originalUrl === '/' || req.originalUrl.indexOf('.') === -1) {
    var pathWebsite = path.join(config.root, config.publish.url, req.originalUrl)
    if (!folderUtils.isFolder(pathWebsite)) {
      return next()
    }
    var files = FileParser.getFiles(pathWebsite, true, 0, /(.*?)/)

    var folders = FileParser.getFolders(pathWebsite, true, 0)
    var html = '<ul>'
    html += '<li><a href="/abe/">abe</abe></li>'
    html += '<br />'
    if (req.originalUrl !== '/' && req.originalUrl !== '') {
      var parent = req.originalUrl.replace(/\/$/, '').split('/')
      parent.pop()
      parent = parent.join('/') + '/'
      html += '<li><a href="' + parent + '">../</abe></li>'
    }

    if(typeof folders !== 'undefined' && folders !== null) {
       
      Array.prototype.forEach.call(folders, (folder) => {
        var url = folder.path.replace(config.root, '').replace(config.publish.url, '')
        html += '<li><a href="' + url + '">/' + folder.cleanPath + '</a></li>'
      })

    }
    if(typeof files !== 'undefined' && files !== null) {
      Array.prototype.forEach.call(files, (file) => {
        var url = file.path.replace(config.root, '').replace(config.publish.url, '')
        html += '<li><a href="' + url + '">' + file.cleanPath + '</a></li>'
      })
    }
    html += '</ul>'
    
    res.set('Content-Type', 'text/html')
    return res.send(html)
  }else if (req.originalUrl.indexOf('.' + config.files.templates.extension) > -1) {

    var html = ''

    var page = path.join(config.root, config.publish.url, req.originalUrl)
    if (fileUtils.isFile(page)) {
      html = fileUtils.getFileContent(page)

    }else {
      return next()
    }

    html = Hooks.instance.trigger('beforePreview', html, req, res, next)
    res.set('Content-Type', 'text/html')
    return res.send(html)

  }else {
    return next()
  }
}

export default middleware