import path from 'path'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'
import moment from 'moment'

import {
  abeExtend,
  coreUtils,
  cmsData,
  config
} from '../../'

export function getAbeMeta(fileObject, json) {
  const fileStatusIsPublish = cmsData.fileAttr.get(fileObject.cleanPath)

  if(json.abe_meta.latest.date != null) {
    fileObject.date = json.abe_meta.latest.date
    fileObject.cleanDate = moment(json.abe_meta.latest.date).format('YYYY/MM/DD HH:mm:ss')
  }

  if(json.abe_meta != null) {
    if (json.abe_meta.status === 'publish') {
      fileObject.htmlPath = path.join(config.root, config.publish.url, path.join('/', fileObject.filePath.replace(/\.json/, `.${config.files.templates.extension}`)))
    }
    var date = null
    if (json.abe_meta.latest.date !== null) {
      date = json.abe_meta.latest.date
    } else if (json.abe_meta.date !== null) {
      date = json.abe_meta.date
    }
    fileObject.abe_meta = {
      date: date,
      type: (json.abe_meta.type != null) ? json.abe_meta.type : null,
      link: (json.abe_meta.link != null) ? json.abe_meta.link : null,
      template: (json.abe_meta.template != null) ? json.abe_meta.template : null,
      cleanName: (json.abe_meta.cleanName != null) ? json.abe_meta.cleanName : null,
      cleanFilename: (json.abe_meta.cleanFilename != null) ? json.abe_meta.cleanFilename : null,
      status: (json.abe_meta.status != null) ? json.abe_meta.status : null
    }
    if(fileStatusIsPublish.s != null && json.abe_meta.status === 'publish') {
      fileObject.abe_meta.status = 'draft'
    }
  }

  return fileObject
}

export function getAllWithKeys(withKeys) {
  const pathData = path.join(config.root, config.data.url)
  const extension = '.json'
  const files = coreUtils.file.getFilesSync(pathData, true, extension)

  let filesArr = []

  Array.prototype.forEach.call(files, (pathFile) => {
    const json = cmsData.file.get(pathFile)
    let fileObject = cmsData.file.getFileObject(pathFile)
    fileObject = cmsData.file.getAbeMeta(fileObject, json)
    
    Array.prototype.forEach.call(withKeys, (key) => {
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
  }catch(e) {
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

  if(url != null) {
    const dir = path.dirname(url).replace(config.root, '')
    const filename = path.basename(url)
    const pathPublish = path.join(config.root,config.publish.url,path.sep)
    
    let link = url.replace(pathPublish, '')
    link = link.replace(new RegExp('\\' + path.sep, 'g'), '/')
    link = cmsData.fileAttr.delete('/'+link)

    let publish = config.publish.url
    let data = config.data.url

    res.root = config.root

    res.json.dir = coreUtils.file.changePath(dir, data)
    res.publish.dir = coreUtils.file.changePath(dir, publish)
    res.publish.json = res.json.dir

    res.publish.file = cmsData.fileAttr.delete(filename)
    res.publish.link = link
    res.json.file = filename.replace(`.${config.files.templates.extension}`, '.json')
    res.publish.json = path.join(res.json.dir, cmsData.fileAttr.delete(res.json.file))

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

  Array.prototype.forEach.call(files, (file) => {
    var val = cmsData.fileAttr.get(file).s
    if(type === null || val === type) result.push(file)
  })

  return result
}

export function getFileObject(pathFile) {
  const pathData = path.join(config.root, config.data.url)
  const extension = '.json'
  const templateExtension = '.' + config.files.templates.extension

  const name = path.basename(pathFile)
  const relativePath = pathFile.replace(pathData + path.sep, '')

  const parentName = cmsData.fileAttr.delete(name)
  const parentRelativePath = cmsData.fileAttr.delete(pathFile).replace(pathData + path.sep, '')

  const fileData = cmsData.fileAttr.get(name)

  let date
  if (fileData.d) {
    date = fileData.d
  }else {
    const stat = fse.statSync(pathFile)
    date = stat.mtime
  }

  const fileDate = moment(date)
  const duration = moment.duration(moment(fileDate).diff(new Date())).humanize(true)

  const htmlUrl = path.join('/', relativePath.replace(extension, templateExtension))
  
  let fileObject = {
    'name': name,
    'path': pathFile,
    'cleanPath': relativePath,
    'filePath': relativePath,
    'date': date,
    'cleanDate': fileDate.format('YYYY/MM/DD HH:mm:ss'),
    'duration': duration,
    'cleanName': parentName,
    'parentRelativePath': parentRelativePath,
    'html': htmlUrl
  }

  return fileObject
}
