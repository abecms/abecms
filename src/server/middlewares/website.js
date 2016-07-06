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
  serveSite,
  Handlebars,
  cleanSlug
} from '../../cli'

import {editor} from '../controllers/editor'
import locale from '../helpers/abe-locale'

var middleware = function(req, res, next) {
  if (req.originalUrl === '') {
    var result = FileParser.getAllFiles()
    var html = '<a href="/abe/">abe</abe>'
    if(typeof result[0].files !== 'undefined' && result[0].files !== null) {
       html = '<ul>'
      Array.prototype.forEach.call(result[0].files, (item) => {
        html += '<li><a href="' + item.path + '">' + item.path + '</a></li>'
      })

      html += '</ul>'
    }
    
    res.set('Content-Type', 'text/html')
    return res.send(html);
  }else if (req.originalUrl.indexOf('.' + config.files.templates.extension) > -1) {

    var html = '';

    var page = fileUtils.concatPath(config.root, config.publish.url, req.originalUrl)
    if (fileUtils.isFile(page)) {
      html = fileUtils.getFileContent(page);

    }else {
      return next()
    }
    res.set('Content-Type', 'text/html')
    return res.send(html);

  }else {
    return next()
  }
}

export default middleware