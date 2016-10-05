import {
  FileParser,
  fileUtils,
  config,
  cmsData,
  Manager
} from '../../'

export function getFilesRevision(urls, fileName) {
  var res = []
  var number = 1
  var tplUrl = FileParser.getFileDataFromUrl(fileName)
  fileName = fileName.split('/')
  fileName = fileName[fileName.length - 1]
  var publishDate = new Date()
  var json = null

  if(fileUtils.isFile(tplUrl.publish.json)) {
    json = FileParser.getJson(tplUrl.publish.json)
    if(typeof json !== 'undefined' && json !== null
      && typeof json[config.meta.name] !== 'undefined' && json[config.meta.name] !== null) {
      publishDate = new Date(json[config.meta.name].latest.date)
    }
  }

  var publishVersion = false
  urls.forEach(function (urlObj) {
    var fileData = cmsData.fileAttr.get(urlObj.cleanPath)
    if(fileData.s === 'd' && cmsData.fileAttr.delete(urlObj.cleanPath) == cmsData.fileAttr.delete(fileName)) {
      var currentDate = new Date(urlObj.date)
      if(currentDate.getTime() > publishDate.getTime()) {
        if(!publishVersion && typeof res[res.length - 1] !== 'undefined' && res[res.length - 1] !== null) {
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

      var tplUrlObj = FileParser.getFileDataFromUrl(urlObj.path)
      if(fileUtils.isFile(tplUrlObj.publish.json)) {
        var jsonObj = FileParser.getJson(tplUrlObj.publish.json)
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
  var dataFile = docPath.replace('.' + config.files.templates.extension, '.json')

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
  }else if (!latest) {
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