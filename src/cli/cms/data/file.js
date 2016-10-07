import path from 'path'
import fse from 'fs-extra'

import {
  Hooks,
  FileParser,
  cmsData,
  config
} from '../../'

export function getAllWithKeys(withKeys) {
  var files = FileParser.getFiles(path.join(config.root, config.data.url), true, 99, /\.json/)
  var filesArr = []

  files.forEach(function (file) {
    var cleanFile = file
    var json = cmsData.file.get(file.path)

    if(typeof json.abe_meta.latest !== 'undefined' && json.abe_meta.latest !== null
      && typeof json.abe_meta.latest !== 'undefined' && json.abe_meta.latest !== null
      && typeof json.abe_meta.latest.date !== 'undefined' && json.abe_meta.latest.date !== null) {
      file.date = json.abe_meta.latest.date
    }

    if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
      var date = null
      if (typeof json.abe_meta.latest !== 'undefined' && json.abe_meta.latest !== null
        && typeof json.abe_meta.latest.date !== 'undefined' && json.abe_meta.latest.date !== null) {
        date = json.abe_meta.latest.date
      }else if (typeof json.abe_meta.date !== 'undefined' && json.abe_meta.date !== null) {
        date = json.abe_meta.date
      }
      cleanFile.abe_meta = {
        date: date
        , type: (typeof json.abe_meta.type !== 'undefined' && json.abe_meta.type !== null) ? json.abe_meta.type : null
        , link: (typeof json.abe_meta.link !== 'undefined' && json.abe_meta.link !== null) ? json.abe_meta.link : null
        , template: (typeof json.abe_meta.template !== 'undefined' && json.abe_meta.template !== null) ? json.abe_meta.template : null
        , status: (typeof json.abe_meta.status !== 'undefined' && json.abe_meta.status !== null) ? json.abe_meta.status : null
        , cleanName: (typeof json.abe_meta.cleanName !== 'undefined' && json.abe_meta.cleanName !== null) ? json.abe_meta.cleanName : null
        , cleanFilename: (typeof json.abe_meta.cleanFilename !== 'undefined' && json.abe_meta.cleanFilename !== null) ? json.abe_meta.cleanFilename : null
      }
    }
    Array.prototype.forEach.call(withKeys, (key) => {
      var keyFirst = key.split('.')[0]
      cleanFile[keyFirst] = json[keyFirst]
    })
    filesArr.push(cleanFile)
  })

  var merged = cmsData.revision.getFilesMerged(filesArr)

  Hooks.instance.trigger('afterGetAllFiles', merged)
  return merged
}

export function get(pathJson) {
  var json = {}
  pathJson = Hooks.instance.trigger('beforeGetJson', pathJson)
  
  try {
    var stat = fse.statSync(pathJson)
    if (stat) {
      json = fse.readJsonSync(pathJson)
    }
  }catch(e) {
  }

  json = Hooks.instance.trigger('afterGetJson', json)
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

  if(typeof url !== 'undefined' && url !== null) {

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
    res.draft.dir = FileParser.changePathEnv(path.join(config.root, dir), draft)
    res.json.dir = FileParser.changePathEnv(path.join(config.root, dir), data)
    res.publish.dir = FileParser.changePathEnv(path.join(config.root, dir), publish)
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