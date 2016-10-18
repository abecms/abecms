import path from 'path'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import limax from 'limax'

import {
  config,
  abeExtend
} from '../../cli'

var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  var resp = {success: 1}
  var filePath
  var folderWebPath = '/' + config.upload.image
  folderWebPath = abeExtend.hooks.instance.trigger('beforeSaveImage', folderWebPath, req)
  var folderFilePath = path.join(config.root, config.publish.url, folderWebPath)
  mkdirp.sync(folderFilePath)
  req.pipe(req.busboy)
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var ext = path.extname(filename)
    var filenameNoExt = path.basename(filename,ext)
    var randID = '-' + (((1+Math.random())*0x100000)|0).toString(16).substring(2)
    var slug = limax(filenameNoExt, {separateNumbers: false}) + randID + ext
    var hasSentHeader = false
    
    filePath = path.join(folderFilePath, slug)
    resp['filePath'] = path.join(folderWebPath, slug)

    var returnErr = function (msg) {
      hasSentHeader = true
      file.resume()
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify({error: 1, response: msg}))
    }

    file.on('limit', function() {
      returnErr('file is too big')
    })

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png' && mimetype !== 'image/svg+xml' && mimetype !== 'video/mp4') {
      returnErr('unauthorized file')
    } else if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.svg' && ext !== '.mp4') {
      returnErr('not a valid asset')
    }

    var fstream = fse.createWriteStream(filePath)

    fstream.on('finish', function() {
      if(hasSentHeader) return
      if(/\.(jpg|png|gif|svg)/.test(filePath)){
        resp = abeExtend.hooks.instance.trigger('afterSaveImage', resp, req)
      }
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify(resp))
    })

    file.pipe(fstream)
  })
}

export default route