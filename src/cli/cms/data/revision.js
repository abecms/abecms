import fse from 'fs-extra'
import path from 'path'

import {
  config,
  cmsData,
  cmsOperations,
  coreUtils,
  Manager
} from '../../'

export function getFilesRevision(urls, fileName) {
  var res = []
  var number = 1
  var tplUrl = cmsData.file.fromUrl(fileName)
  fileName = fileName.split('/')
  fileName = fileName[fileName.length - 1]
  var publishDate = new Date()
  var json = null

  if(coreUtils.file.exist(tplUrl.publish.json)) {
    json = cmsData.file.get(tplUrl.publish.json)
    if(json != null && json[config.meta.name] != null) {
      publishDate = new Date(json[config.meta.name].latest.date)
    }
  }

  var publishVersion = false
  urls.forEach(function (urlObj) {
    var fileData = cmsData.fileAttr.get(urlObj.cleanPath)
    if(fileData.s === 'd' && cmsData.fileAttr.delete(urlObj.cleanPath) == cmsData.fileAttr.delete(fileName)) {
      var currentDate = new Date(urlObj.date)
      if(currentDate.getTime() > publishDate.getTime()) {
        if(!publishVersion && res[res.length - 1] != null) {
          res[res.length - 1].publishedDate = 'same'
        }
        publishVersion = true
        urlObj.publishedDate = 'after'
        
      }else if(currentDate.getTime() === publishDate.getTime()) {
        urlObj.publishedDate = 'same'
        publishVersion = true
      }else {
        urlObj.publishedDate = 'before'
      }
      urlObj.version = number
      number = number + 1

      var tplUrlObj = cmsData.file.fromUrl(urlObj.path)
      if(coreUtils.file.exist(tplUrlObj.publish.json)) {
        var jsonObj = cmsData.file.get(tplUrlObj.publish.json)
        urlObj[config.meta.name] = jsonObj[config.meta.name]
      }
      res.push(urlObj)
    }
  })
  return res
}

/**
 * Create and array of doc file path containing the versions of this doc
 * @param  {String} path of a doc
 * @return {Array} the versions of the doc
 */
export function getVersions(docPath) {
  var result = []
  var files = Manager.instance.getList()
  var dataFile = path.join(config.data.url, docPath.replace('.' + config.files.templates.extension, '.json'))
  Array.prototype.forEach.call(files, (file) => {
    if (file.path.indexOf(dataFile) > -1) {
      result = file.revisions
    }
  })
  return result
}

/**
 * Return the revision from document html file path
 * if the docPath contains abe revision [status]-[date] will try to return this revision
 * else it will return the latest revision
 * or null
 * 
 * @param  {String} html path
 * @return {Object} file revision | null
 */
export function getDocumentRevision(docPath) {
  var result = null
  var documentPath = docPath
  var latest = true

  if(cmsData.fileAttr.test(documentPath)){
    latest = false
    documentPath = cmsData.fileAttr.delete(documentPath)
  }
  var revisions = getVersions(documentPath)
  if (latest && revisions.length >= 0) {
    result = revisions[0]
  } else if (!latest) {
    Array.prototype.forEach.call(revisions, (revision) => {
      if (revision.html === docPath) {
        result = revision
      }
    })
    if (result === null && revisions.length >= 0) {
      result = revisions[0]
    }
  }
  return result
}

export function getStatusAndDateToFileName(date) {
  var res = date.substring(0, 4) + '-'
            + date.substring(4, 6) + '-'
            + date.substring(6, 11) + ':'
            + date.substring(11, 13) + ':'
            + date.substring(13, 15) + '.'
            + date.substring(15, 19)
  return res
}

export function removeStatusAndDateFromFileName(date) {
  return date.replace(/[-:\.]/g, '')
}

export function filePathInfos(pathFolder) {
  var pathArr = pathFolder.split('/')
  var name = pathArr[pathArr.length - 1]

  var rootArr = config.root.split('/')
  var website = rootArr[pathArr.length - 1]
  return {
    'name': name,
    'path': pathFolder,
    'website': website,
    'cleanPath': pathFolder.replace(config.root, '').replace(/\/$/, ''),
    'type': 'folder'
  }
}

export function getFilesMerged(files) {
  var merged = {}
  var arMerged = []
  
  Array.prototype.forEach.call(files, (file) => {
    var cleanFilePath = file.cleanFilePath

    var fileStatusIsPublish = cmsData.fileAttr.get(file.cleanPath)
    if(fileStatusIsPublish.s != null && file.abe_meta.status === 'publish') {
      file.abe_meta.status = 'draft'
    }

    file.html = path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`))
    if (file.abe_meta.status === 'publish') {
      file.htmlPath = path.join(config.root, config.publish.url, path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))
    }else {
      file.htmlPath = path.join(config.root, config.draft.url, path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))
    }

    if(merged[cleanFilePath] == null) {
      merged[cleanFilePath] = {
        name: cmsData.fileAttr.delete(file.name),
        path: cmsData.fileAttr.delete(file.path),
        html: cmsData.fileAttr.delete(path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`))),
        htmlPath: path.join(config.root, config.publish.url, path.join('/', cmsData.fileAttr.delete(file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))),
        cleanPathName: file.cleanPathName,
        cleanPath: file.cleanPath,
        cleanName: file.cleanName,
        cleanNameNoExt: file.cleanNameNoExt,
        cleanFilePath: file.cleanFilePath,
        filePath: cmsData.fileAttr.delete(file.filePath),
        revisions: []
      }
    }

    merged[cleanFilePath].revisions.push(JSON.parse(JSON.stringify(file)))
  })

  // return merged
  Array.prototype.forEach.call(Object.keys(merged), (key) => {
    var revisions = merged[key].revisions

    revisions.sort(coreUtils.sort.predicatBy('date', -1))
    if(revisions[0] != null) {
      merged[key].date = revisions[0].date
    }
    Array.prototype.forEach.call(revisions, (revision) => {
      var status = revision.abe_meta.status
      if(typeof merged[key][status] === 'undefined' || merged[key][status] === null) {
        if (status === 'publish') {
          merged[key][status] = revision
        }else {
          merged[key][status] = {}
        }
        merged[key][status].path = revision.path
        merged[key][status].html = revision.html
        merged[key][status].htmlPath = revision.htmlPath
        merged[key][status].date = new Date(revision.date)
        merged[key][status].cleanDate = revision.cleanDate
        merged[key][status].link = revision.abe_meta.link
      }
    })

    merged[key].revisions = revisions

    merged[key].date = revisions[0].date
    merged[key].cleanDate = revisions[0].cleanDate
    merged[key].duration = revisions[0].duration
    merged[key].abe_meta = revisions[0].abe_meta

    arMerged.push(merged[key])
  })

  return arMerged
}

export function deleteOlderRevisionByType(fileName, type) {
  var folder = fileName.split('/')
  var file = folder.pop()
  var extension = file.replace(/.*?\./, '')
  folder = folder.join('/')
  var stat = fse.statSync(folder)
  if(stat){
    var files = cmsData.file.getFiles(folder, true, 1, new RegExp('\\.' + extension))
    files.forEach(function (fileItem) {
      var fname = cmsData.fileAttr.delete(fileItem.cleanPath)
      var ftype = cmsData.fileAttr.get(fileItem.cleanPath).s
      if(fname === file && ftype === type){
        var fileDraft = fileItem.path.replace(/-abe-./, '-abe-d')
        cmsOperations.remove.removeFile(fileItem.path, coreUtils.file.changePath(fileItem.path, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
        cmsOperations.remove.removeFile(fileDraft, coreUtils.file.changePath(fileDraft, config.data.url).replace(new RegExp('\\.' + extension), '.json'))
      }
    })
  }
}