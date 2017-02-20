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
    var resp = {success: 1}
    var filePath
    req.pipe(req.busboy)
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      var ext = path.extname(filename).toLowerCase()
      var slug = createMediaSlug(filename, ext)
      var mediaType = getMediaType(ext)

      var folderFilePath = createMediaFolder(mediaType)
      var hasSentHeader = false
      var folderWebPath = '/' + config.upload.image
      if(config.upload[mediaType] != null){
        folderWebPath = '/' + config.upload[mediaType]  
      }
      
      filePath = path.join(folderFilePath, slug)
      resp['filePath'] = path.join('/' + folderWebPath, slug)

      file.on('limit', function() {
        hasSentHeader = true
        file.resume()
        resolve({error: 1, response: 'file is too big'})
        return
      })

      var isValid = isValidMedia(mimetype, ext)
      if(isValid.error){
        hasSentHeader = true
        file.resume()
        resolve({error: 1, response: isValid.error})
        return
      }

      var fstream = fse.createWriteStream(filePath)
      fstream.on('finish', function() {
        if(hasSentHeader) return

        resp = abeExtend.hooks.instance.trigger('afterSaveImage', resp, req)

        if(mediaType === 'image') {
          var thumbPromise = generateThumbnail(filePath)
          thumbPromise.then(function (thumbResp) {
            resp.thumbnail = thumbResp.thumb
            if(req && req.query && req.query.input && ( req.query.input.indexOf('data-size') > -1 )){
              var thumbsSizes = cmsData.regex.getAttr(req.query.input, 'data-size').split(',')
              cropAndSaveFiles(thumbsSizes, filePath, resp).then(function (resp) {
                resolve(resp)
              })
            }
            else resolve(resp)
          })
        } else {
          resolve(resp)
        }
      })
      file.pipe(fstream)
    })
  })

  return p
}

export function isValidMedia(mimetype, ext) {
  var allowedExtensions = config.upload.extensions
  var allowedMimetypes = config.upload.mimetypes

  var error = false
  if (allowedMimetypes.indexOf(mimetype) < 0) error = ext + ' is not an authorized extension'
  else if (allowedExtensions.indexOf(ext) < 0) error = ext + ' is not an authorized extension'

  return {error: error}
}

export function getMediaType(ext) {
  let type = 'document'

  if(/\.(jpg|jpeg|png|gif|svg)/.test(ext)){
    type = 'image'
  } else if(/\.(mov|avi|mp4)/.test(ext)) {
    type = 'video'
  } else if(/\.(mp3|wav)/.test(ext)){
    type = 'sound'
  }

  return type
}

export function createMediaSlug(filename, ext) {
  var filenameNoExt = path.basename(filename, ext)
  return limax(filenameNoExt, {separateNumbers: false}) + '-' + coreUtils.random.generateUniqueIdentifier(2) + ext
}

export function createMediaFolder(mediaType) {
  var folderWebPath = '/' + config.upload.image
  if(config.upload[mediaType] != null){
    folderWebPath = '/' + config.upload[mediaType]  
  }
  folderWebPath = abeExtend.hooks.instance.trigger('beforeSaveImage', folderWebPath)
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
  var rexMatchImageName = /_(thumb|\d+x\d+)\./
  name = path.join(path.sep, name)
  var originalName = path.join(path.sep, name.replace(rexMatchImageName, '.'))
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
    if(pathFile !== originalName && pathFile !== name && pathFile.replace(rexMatchImageName, '.') === originalName){
      imageList.thumbs.push(pathFile)
    }
  })

  return imageList
}
