import path from 'path'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'
import moment from 'moment'

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

export function getAllWithKeys(withKeys) {
  const extension = '.json'
  const files = coreUtils.file.getFilesSync(Manager.instance.pathData, true, extension)

  let filesArr = []

  Array.prototype.forEach.call(files, pathFile => {
    const json = cmsData.file.get(pathFile)
    let fileObject = cmsData.file.getFileObject(pathFile)
    fileObject = cmsData.file.getAbeMeta(fileObject, json)
    Array.prototype.forEach.call(withKeys, key => {
      fileObject[key] = json[key]
    })

    filesArr.push(fileObject)
  })

  var merged = cmsData.revision.getFilesMerged(filesArr)
  abeExtend.hooks.instance.trigger('afterGetAllFiles', merged)

  return merged
}

export function get(pathJson) {
  let json
  pathJson = abeExtend.hooks.instance.trigger('beforeGetJson', pathJson)

  try {
    var stat = fse.statSync(pathJson)
    if (stat) {
      json = fse.readJsonSync(pathJson)
    }
  } catch (e) {
    json = {}
  }

  json = abeExtend.hooks.instance.trigger('afterGetJson', json)
  return json
}

export function fromUrl(url) {
  var res = {
    root: '',
    draft: {
      dir: '',
      file: '',
      path: ''
    },
    publish: {
      dir: '',
      file: '',
      link: '',
      path: '',
      json: ''
    },
    json: {
      path: '',
      file: ''
    }
  }

  if (url != null) {
    const dir = path.dirname(url).replace(config.root, '')
    const filename = path.basename(url)
    const pathPublish = path.join(Manager.instance.pathPublish, path.sep)

    let link = url.replace(pathPublish, '')
    link = link.replace(new RegExp('\\' + path.sep, 'g'), '/')
    link = cmsData.fileAttr.delete('/' + link)

    const publishPath = Manager.instance.pathPublish.replace(config.root, '')
    const dataPath = Manager.instance.pathData.replace(config.root, '')

    res.root = config.root

    res.json.dir = coreUtils.file.changePath(dir, dataPath)
    res.publish.dir = coreUtils.file.changePath(dir, publishPath)
    res.publish.json = res.json.dir

    res.publish.file = cmsData.fileAttr.delete(filename)
    res.publish.link = link
    res.json.file = filename.replace(
      `.${config.files.templates.extension}`,
      '.json'
    )
    res.publish.json = path.join(
      res.json.dir,
      cmsData.fileAttr.delete(res.json.file)
    )

    res.publish.path = path.join(res.publish.dir, res.publish.file)
    res.json.path = path.join(res.json.dir, res.json.file)
  }
  return res
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

export function getFileObject(revisionPath) {
  let name = path.basename(revisionPath)
  const fileData = cmsData.fileAttr.get(name)
  name = cmsData.fileAttr.delete(name)

  let date
  if (fileData.d) {
    date = fileData.d
  } else {
    const stat = fse.statSync(revisionPath)
    date = stat.mtime
  }

  const fileObject = {
    name: name,
    path: revisionPath,
    date: date
  }

  return fileObject
}
