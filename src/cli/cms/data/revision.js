import path from 'path'

import {
  config,
  cmsData,
  coreUtils,
  Manager
} from '../../'

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
    'type': 'folder'
  }
}

export function mergeRevisions(files) {
  let merged = {}
  
  Array.prototype.forEach.call(files, (file) => {
    const docRelativePath = cmsData.utils.getDocRelativePath(file.path)

    if(merged[docRelativePath] == null) {
      merged[docRelativePath] = {
        path: cmsData.utils.getDocPath(file.path),
        revisions: []
      }
    }
    merged[docRelativePath].revisions.push(JSON.parse(JSON.stringify(file)))
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
      merged[key].name = revisions[0].name
      merged[key].date = revisions[0].date
      merged[key].abe_meta = revisions[0].abe_meta
    }

    let newStatuses = []
    Array.prototype.forEach.call(revisions, (revision) => {
      const revisionStatus = revision.abe_meta.status

      if(typeof revisionStatus !== 'undefined' && revisionStatus !== null && revisionStatus != '') {
        if(!(revisionStatus in newStatuses)) {
          if (revisionStatus === 'publish') {
            merged[key][revisionStatus] = revision
          } else {
            merged[key][revisionStatus] = {}
          }
          merged[key][revisionStatus].path = revision.path
          merged[key][revisionStatus].date = revision.date
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
