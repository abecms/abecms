import path from 'path'

import {
  config,
  cmsData,
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

export function mergeRevisions(files) {
  let merged = {}
  
  Array.prototype.forEach.call(files, (file) => {
    const parentRelativePath = file.parentRelativePath

    if(merged[parentRelativePath] == null) {
      merged[parentRelativePath] = {
        name: cmsData.fileAttr.delete(file.name),
        path: cmsData.fileAttr.delete(file.path),
        html: cmsData.fileAttr.delete(path.join('/', file.filePath.replace(/\.json/, `.${config.files.templates.extension}`))),
        htmlPath: path.join(config.root, config.publish.url, path.join('/', cmsData.fileAttr.delete(file.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))),
        cleanPath: file.cleanPath,
        cleanName: file.cleanName,
        parentRelativePath: file.parentRelativePath,
        filePath: cmsData.fileAttr.delete(file.filePath),
        revisions: []
      }
    }
    merged[parentRelativePath].revisions.push(JSON.parse(JSON.stringify(file)))
  })

  return merged
}

export function sortRevisions(merged) {
  let sortedArray = []

  Array.prototype.forEach.call(Object.keys(merged), (key) => {
    let revisions = merged[key].revisions
    revisions.sort(coreUtils.sort.predicatBy('date', -1))
    merged[key].revisions = revisions

    if(revisions[0] != null) {
      merged[key].date = revisions[0].date
      merged[key].cleanDate = revisions[0].cleanDate
      merged[key].duration = revisions[0].duration
      merged[key].abe_meta = revisions[0].abe_meta
    }

    let newStatuses = []
    Array.prototype.forEach.call(revisions, (revision) => {
      const revisionStatus = revision.abe_meta.status

      if(typeof revisionStatus !== 'undefined' && revisionStatus !== null && revisionStatus != '') {
        if(!(revisionStatus in newStatuses)) {
          if (revisionStatus === 'publish') {
            merged[key][revisionStatus] = revision
          }else {
            merged[key][revisionStatus] = {}
          }
          merged[key][revisionStatus].path = revision.path
          merged[key][revisionStatus].html = revision.html
          merged[key][revisionStatus].htmlPath = revision.htmlPath
          merged[key][revisionStatus].date = revision.date
          merged[key][revisionStatus].cleanDate = revision.cleanDate
          merged[key][revisionStatus].link = revision.abe_meta.link

          newStatuses[revisionStatus] = true
        }
      }
    })

    sortedArray.push(merged[key])
  })

  return sortedArray
}

export function getFilesMerged(files) {
  const revisions = cmsData.revision.mergeRevisions(files)

  return cmsData.revision.sortRevisions(revisions)
}
