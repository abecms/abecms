import path from 'path'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'

import {abeExtend, coreUtils, cmsData, config, Manager} from '../../'

export function getAbeMeta(fileObject, json) {
  if (json.name != null) {
    fileObject.name = json.name
  }

  if (json.abe_meta != null) {
    var date = null

    if (json.abe_meta.updatedDate != null) {
      fileObject.date = json.abe_meta.updatedDate
      date = json.abe_meta.updatedDate
    } else if (
      json.abe_meta.latest != null &&
      json.abe_meta.latest.date != null
    ) {
      fileObject.date = json.abe_meta.latest.date
      date = json.abe_meta.latest.date
    } else if (json.abe_meta.date !== null) {
      date = json.abe_meta.date
    }

    fileObject.abe_meta = {
      date: date,
      link: json.abe_meta.link != null ? json.abe_meta.link : null,
      template: json.abe_meta.template != null ? json.abe_meta.template : null,
      status: json.abe_meta.status != null ? json.abe_meta.status : null
    }
  }

  return fileObject
}

export async function getAllWithKeys(withKeys) {
  const extension = '.json'
  const files = await coreUtils.file.getFiles(
    Manager.instance.pathData,
    true,
    extension
  )

  let filesArr = []

  await Promise.all(files.map(async pathFile => {
    const json = await cmsData.revision.getDoc(pathFile)
    let fileObject = cmsData.file.getFileObject(pathFile, json)
    fileObject = cmsData.file.getAbeMeta(fileObject, json)
    Array.prototype.forEach.call(withKeys, key => {
      fileObject[key] = json[key]
    })

    filesArr.push(fileObject)
  }));

  return filesArr
}

export async function get(pathJson) {
  pathJson = cmsData.utils.getRevisionPath(pathJson)
  let json = {}
  pathJson = abeExtend.hooks.instance.trigger('beforeGetJson', pathJson)

  try {
    var stat = await fse.statSync(pathJson)
    if (stat) {
      json = fse.readFileSync(pathJson)
      json = JSON.parse(json)
    }
  } catch (e) {
    //console.log('error get', e)
    json = {}
  }

  json = abeExtend.hooks.instance.trigger('afterGetJson', json)
  return json
}

export function getFilesByType(pathFile, type = null) {
  const extension = '.' + config.files.templates.extension
  let result = []

  try {
    var directory = fse.lstatSync(pathFile)
    if (!directory.isDirectory()) {
      mkdirp.sync(pathFile)
    }
  } catch (e) {
    mkdirp.sync(pathFile)
  }
  const files = coreUtils.file.getFilesSync(pathFile, true, extension)

  Array.prototype.forEach.call(files, file => {
    var val = cmsData.fileAttr.get(file).s
    if (type === null || val === type) result.push(file)
  })

  return result
}

export function getFileObject(relativePath, json) {
  const pathFile = cmsData.utils.getRevisionPath(relativePath)

  let name = path.basename(pathFile)
  name = cmsData.fileAttr.delete(name)

  let fileObject = {
    name: name,
    date: cmsData.fileAttr.getDate(pathFile),
    path: pathFile
  }

  return fileObject
}
