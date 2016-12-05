import execPromise from 'child-process-promise'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'
import limax from 'limax'
import Jimp from 'jimp'
import path from 'path'
import {Promise} from 'bluebird'

import {
  abeExtend,
  coreUtils,
  cmsData,
  config
} from '../../'

export function cropAndSaveFile(imageSize, file, newFile) {
  var p = new Promise((resolve) => {
    Jimp.read(file).then(function (lenna) {
      lenna.crop(0, 0, parseInt(imageSize[0]), parseInt(imageSize[1])).write(newFile)
    }).catch(function (err) {
      console.error(err)
    })
    resolve()
  })
  return p
}

export function smartCropAndSaveFile(imageSize, file, newFile) {
  var cmd = `node node_modules/smartcrop-cli/smartcrop-cli.js --width ${parseInt(imageSize[0])} --height ${parseInt(imageSize[1])} ${file} ${newFile}`
  var p = execPromise.exec(cmd)
  return p
}

export function cropAndSaveFiles(images, file, resp) {
  var length = images.length
  var cropedImage = 0
  resp.thumbs = []
  var p = new Promise((resolve) => {
    for (var i = 0; i < length; i++) {
      var image = images[i]
      var ext = path.extname(file)
      var newFile = file.replace(ext, `_${images[i]}${ext}`)
      resp.thumbs.push({
        name: newFile.replace(path.join(config.root, config.publish.url), ''),
        size: image
      })
      smartCropAndSaveFile(image.split('x'), file, newFile)
        .then(function (result) {
          if(result.stderr) {
            cropAndSaveFile(image.split('x'), file, newFile).then(function () {
              if(++cropedImage === length) {
                resolve(resp)
              }
            })
          }
          else if(++cropedImage === length) {
            resolve(resp)
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    }
  })

  return p
}

export function generateThumbnail(file) {
  var ext = path.extname(file).toLowerCase()
  var thumbFileName = file.replace(ext, `_thumb${ext}`)
  var thumbFileNameRelative = thumbFileName.replace(path.join(config.root, config.publish.url), '')
  var p = new Promise((resolve) => {
    var cropThumb = smartCropAndSaveFile([250, 250], file, thumbFileName)
    cropThumb.then(function (result) {
      var stderr = result.stderr
      if(stderr) {
        cropAndSaveFile([250, 250], file, thumbFileName).then(function () {
          resolve({thumb: thumbFileNameRelative})
        })
      }
      else resolve({thumb: thumbFileNameRelative})
    })
  })

  return p
}

export function saveFile(req) {
  var p = new Promise((resolve) => {
    var folderFilePath = createMediaFolder(req)
    var resp = {success: 1}
    var filePath
    req.pipe(req.busboy)
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      var ext = path.extname(filename).toLowerCase()
      var slug = createMediaSlug(filename, ext)
      var hasSentHeader = false
      
      filePath = path.join(folderFilePath, slug)
      resp['filePath'] = path.join('/' + config.upload.image, slug)

      var returnErr = function (msg) {
        hasSentHeader = true
        file.resume()
        resolve({error: 1, response: msg})
      }

      file.on('limit', function() {
        returnErr('file is too big')
      })

      var isValid = isValidMedia(mimetype, ext)
      if(isValid.error) returnErr(isValid.error)

      var fstream = fse.createWriteStream(filePath)
      fstream.on('finish', function() {
        if(hasSentHeader) return
        if(/\.(jpg|png|gif|svg)/.test(filePath)) resp = abeExtend.hooks.instance.trigger('afterSaveImage', resp, req)

        var thumbPromise = generateThumbnail(filePath)
        thumbPromise.then(function (thumbResp) {
          resp.thumbnail = thumbResp.thumb
          if(req.query.input.indexOf('data-size') > -1){
            var thumbsSizes = cmsData.regex.getAttr(req.query.input, 'data-size').split(',')
            cropAndSaveFiles(thumbsSizes, filePath, resp).then(function (resp) {
              resolve(resp)
            })
          }
          else resolve(resp)
        })
      })
      file.pipe(fstream)
    })
  })

  return p
}

export function isValidMedia(mimetype, ext) {
  var allowedExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.svg', '.mp4']
  var allowedMimetype = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'video/mp4']
  var error = false
  if (allowedMimetype.indexOf(mimetype) < 0) error = 'unauthorized file'
  else if (allowedExtensions.indexOf(ext) < 0) error = 'not a valid asset'

  return {error: error}
}

export function createMediaSlug(filename, ext) {
  var filenameNoExt = path.basename(filename, ext)
  return limax(filenameNoExt, {separateNumbers: false}) + '-' + coreUtils.random.generateUniqueIdentifier(2) + ext
}

export function createMediaFolder(req) {
  var folderWebPath = '/' + config.upload.image
  folderWebPath = abeExtend.hooks.instance.trigger('beforeSaveImage', folderWebPath, req)
  var folderFilePath = path.join(config.root, config.publish.url, folderWebPath)
  mkdirp.sync(folderFilePath)

  return folderFilePath
}

export function getThumbsList() {
  var thumbsList = []
  var pathToThumbs = path.join(config.root, config.publish.url, config.upload.image)
  var files = coreUtils.file.getFilesSync(pathToThumbs, true)
  Array.prototype.forEach.call(files, (pathFile) => {
    pathFile = pathFile.replace(path.join(config.root, config.publish.url), '')
    if(pathFile.indexOf('_thumb.') > -1){
      thumbsList.push({
        originalFile: pathFile.replace('_thumb.', '.'),
        thumbFile: pathFile
      })
    }
  })

  return thumbsList
}

export function getAssociatedImageFileFromThumb(name) {
  var rexMatchImageName = /_(thumb|\d+x\d+)/
  name = path.join(path.sep, name)
  var originalName = path.join(path.sep, name.replace(rexMatchImageName, ''))
  var imageList = {
    thumbFile: name,
    originalFile: originalName,
    thumbs: []
  }
  var pathThumb = name.split('/')
  pathThumb.pop()
  pathThumb = path.join(config.root, config.publish.url, pathThumb.join('/'))

  var files = coreUtils.file.getFilesSync(pathThumb, true)
  Array.prototype.forEach.call(files, (pathFile) => {
    pathFile = pathFile.replace(path.join(config.root, config.publish.url), '')
    if(pathFile !== originalName && pathFile !== name && pathFile.replace(rexMatchImageName, '') === originalName){
      imageList.thumbs.push(pathFile)
    }
  })

  return imageList
}
