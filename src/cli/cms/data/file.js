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

export function getAllWithKeys(withKeys) {
  var files = cmsData.file.getFiles(path.join(config.root, config.data.url), true, 99, /\.json/)
  var filesArr = []

  files.forEach(function (file) {
    var cleanFile = file
    var json = cmsData.file.get(file.path)

    if(json.abe_meta.latest.date != null) {
      file.date = json.abe_meta.latest.date
      file.cleanDate = moment(json.abe_meta.latest.date).format('YYYY/MM/DD HH:MM:ss')
    }

    if(json.abe_meta != null) {
      var date = null
      if (json.abe_meta.latest.date !== null) {
        date = json.abe_meta.latest.date
      } else if (json.abe_meta.date !== null) {
        date = json.abe_meta.date
      }
      cleanFile.abe_meta = {
        date: date,
        type: (json.abe_meta.type != null) ? json.abe_meta.type : null,
        link: (json.abe_meta.link != null) ? json.abe_meta.link : null,
        template: (json.abe_meta.template != null) ? json.abe_meta.template : null,
        status: (json.abe_meta.status != null) ? json.abe_meta.status : null,
        cleanName: (json.abe_meta.cleanName != null) ? json.abe_meta.cleanName : null,
        cleanFilename: (json.abe_meta.cleanFilename != null) ? json.abe_meta.cleanFilename : null
      }
    }
    Array.prototype.forEach.call(withKeys, (key) => {
      var keyFirst = key.split('.')[0]
      cleanFile[keyFirst] = json[keyFirst]
    })
    filesArr.push(cleanFile)
  })

  var merged = cmsData.revision.getFilesMerged(filesArr)

  abeExtend.hooks.instance.trigger('afterGetAllFiles', merged)
  return merged
}

export function get(pathJson) {
  var json = {}
  pathJson = abeExtend.hooks.instance.trigger('beforeGetJson', pathJson)
  
  try {
    var stat = fse.statSync(pathJson)
    if (stat) {
      json = fse.readJsonSync(pathJson)
    }
  }catch(e) {
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

    var dir = path.dirname(url).replace(config.root, '')
    var filename = path.basename(url)
    var link = url.replace(config.root, '')
    link = link.replace(/^\//, '').split('/')
    link.shift()
    link = cmsData.fileAttr.delete('/' + link.join('/').replace(/\/$/, ''))

    let draft = config.draft.url
    let publish = config.publish.url
    let data = config.data.url

    res.root = config.root

    // set dir path draft/json
    res.draft.dir = coreUtils.file.changePath(dir, draft)
    res.json.dir = coreUtils.file.changePath(dir, data)
    res.publish.dir = coreUtils.file.changePath(dir, publish)
    res.publish.json = res.json.dir

    // set filename draft/json
    res.draft.file = filename
    res.publish.file = cmsData.fileAttr.delete(filename)
    res.publish.link = link
    res.json.file = filename.replace(`.${config.files.templates.extension}`, '.json')
    res.publish.json = path.join(res.json.dir, cmsData.fileAttr.delete(res.json.file))

    // set filename draft/json
    res.draft.path = path.join(res.draft.dir, res.draft.file)
    res.publish.path = path.join(res.publish.dir, res.publish.file)
    res.json.path = path.join(res.json.dir, res.json.file)
  }
  return res
}

export function getFiles(folder, flatten = false, level, extensions = /(.*?)/, inversePattern = false) {

  var arr = []
  arr = cmsData.file.read(
    folder.replace(/\/$/, ''),
    folder.replace(/\/$/, ''), 
    'files', 
    flatten, 
    extensions, 
    level, 
    0, 
    inversePattern
  )

  return arr
}

export function getFilesByType(pathFile, type = null) {
  try {
    var directory = fse.lstatSync(pathFile)
    if (!directory.isDirectory()) {
      mkdirp.sync(pathFile)
    }
  } catch (e) {
    mkdirp.sync(pathFile)
  }
  var files = cmsData.file.getFiles(pathFile, true, 20, new RegExp(`.${config.files.templates.extension}`))

  var result = []

  Array.prototype.forEach.call(files, (file) => {
    var val = cmsData.fileAttr.get(file.path).s
    if(type === null || val === type) result.push(file)
  })
  return result
}

export function getFileObject(elt, pathLevel, base) {
  var cleanName = cmsData.fileAttr.delete(elt)
  var cleanNameNoExt = cleanName.replace(/\..+$/, '')
  var fileData = cmsData.fileAttr.get(elt)

  var date
  if (fileData.d) {
    date = fileData.d
  }else {
    var stat = fse.statSync(pathLevel)
    date = stat.mtime
  }
  var cleanFilePath = cmsData.fileAttr.delete(pathLevel).replace(config.root, '').replace(/^\/?.+?\//, '')

  var fileDate = moment(date)
  var duration = moment.duration(moment(fileDate).diff(new Date())).humanize(true)

  var filePath = pathLevel.replace(config.root, '')
  filePath = filePath.split('/')
  filePath.shift()
  filePath = filePath.join('/')
  var item = {
    'name': elt,
    'path': pathLevel,
    'cleanPathName': cmsData.fileAttr.delete(pathLevel),
    'cleanPath': pathLevel.replace(base + '/', ''),
    'date': date,
    'cleanDate': fileDate.format('YYYY/MM/DD HH:MM:ss'),
    'duration': duration,
    'cleanName': cleanName,
    'cleanNameNoExt': cleanNameNoExt,
    'cleanFilePath': cleanFilePath,
    'filePath': filePath,
    'type': 'file'
  }

  return item
}

export function read(base, dirName, type, flatten, extensions = /(.*?)/, max = 99, current = 0, inversePattern = false) {
  var arr = []
  var level = fse.readdirSync(dirName)
  var fileCurrentLevel = []
  let assets = config.files.templates.assets

  for (var i = 0; i < level.length; i++) {
    var pathLevel = dirName + '/' + level[i]
    var isFolder = true
    try {
      var directory = fse.lstatSync(pathLevel)
      if (!directory.isDirectory()) {
        isFolder = false
      }
    } catch (e) {
      isFolder = false
    }
    var match = (isFolder) ? true : (inversePattern) ? !extensions.test(level[i]) : extensions.test(level[i])
    if((type === 'files' || type === null) && match) {

      if(level[i].indexOf('.') > -1) {
        var item = cmsData.file.getFileObject(level[i], pathLevel, item)
        if(!flatten) item['folders'] = []
        arr.push(item)
        // push current file name into array to check if siblings folder are assets folder
        fileCurrentLevel.push(level[i].replace(/\..+$/, '') + assets)
      }
    }
    if(!fileCurrentLevel.indexOf(level[i]) >= 0 && match) {
      if(isFolder) {
        if(!flatten) {
          var index = arr.push(
            {
              'name': level[i],
              'path': pathLevel,
              'cleanPath': pathLevel.replace(base + '/', ''),
              'folders': [],
              'type': 'folder'
            }
          ) - 1
          if(current < max){
            arr[index].folders = cmsData.file.read(base, pathLevel, type, flatten, extensions, max, current + 1, inversePattern)
          }
        }else {
          if(type === 'folders' || type === null) {
            arr.push(
              {
                'name': level[i],
                'path': pathLevel,
                'cleanPath': pathLevel.replace(base + '/', ''),
                'type': 'folder'
              }
            )
          }
          if(current < max){
            Array.prototype.forEach.call(cmsData.file.read(base, pathLevel, type, flatten, extensions, max, current + 1, inversePattern), (files) => {
              arr.push(files)
            })
          }
        }
      }
    }
  }

  return arr
}