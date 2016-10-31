import path from 'path'
import fse from 'fs-extra'

import {
  coreUtils,
  cmsData,
  config,
  abeExtend
} from '../../cli'

var middleware = function(req, res, next) {
  if (req.originalUrl.indexOf('/abe/') > -1 || req.originalUrl.indexOf('/plugin/') > -1) {
    return next()
  }

  if (req.originalUrl === '' || req.originalUrl === '/' || req.originalUrl.indexOf('.') === -1) {
    var pathWebsite = path.join(config.root, config.publish.url, req.originalUrl)
    try {
      var directory = fse.lstatSync(pathWebsite)
      if (!directory.isDirectory()) {
        return next()
      }
    } catch (e) {
      return next()
    }
    var files = coreUtils.file.getFilesSync(pathWebsite, false)
    var folders = coreUtils.file.getFoldersSync(pathWebsite, false)
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
        var url = folder.path.replace(path.join(config.root,config.publish.url), '')
        html += '<li><a href="' + url + '">/' + path.basename(folder.path) + '</a></li>'
      })
    }
    if(typeof files !== 'undefined' && files !== null) {
      Array.prototype.forEach.call(files, (file) => {
        var url = file.replace(path.join(config.root,config.publish.url), '')
        html += '<li><a href="' + url + '">' + path.basename(file) + '</a></li>'
      })
    }
    html += '</ul>'
    
    res.set('Content-Type', 'text/html')
    return res.send(html)
  }else if (req.originalUrl.indexOf('.' + config.files.templates.extension) > -1) {

    html = ''

    var page = path.join(config.root, config.publish.url, req.originalUrl)
    if (coreUtils.file.exist(page)) {
      html = fse.readFileSync(page, 'utf8')
    }else {
      return next()
    }

    html = abeExtend.hooks.instance.trigger('beforePreview', html, req, res, next)
    res.set('Content-Type', 'text/html')
    return res.send(html)

  }else {
    return next()
  }
}

export default middleware