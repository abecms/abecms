import path from 'path'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import request from 'request'
import extract from 'extract-zip'

import {
  config,
  cmsTemplates,
  coreUtils
} from '../../'

export function getThemeName(url) {
  var name = url.split('/')

  return name[name.length - 1].replace('.zip')
}

export function getThemeInfos() {
  var pathToTheme = path.join(config.root, config.themes.path, config.themes.name)

  var p = new Promise((resolve) => {
    fse.readJson(path.join(pathToTheme,'theme.json'), (err, json) => {
      // if (err) console.error(err)
      var json = json || {theme: {}}
      resolve(json.theme)
    })
  }).catch(function(e) {
    console.error(e)
  })

  return p
}

export function deleteTheme() {
  var pathToTheme = path.join(config.root, config.themes.path, config.themes.name)
  fse.readJson(path.join(pathToTheme,'theme.json'), (err, json) => {
    if (err) console.error(err)
    if(json != null && json.theme != null && json.theme.root_files != null){
      Array.prototype.forEach.call(json.theme.root_files, (file) => {
        fse.remove(path.join(pathToTheme, file), err => {
          if (err) console.error(err)
        })
      })
    }
  })
}

export function downloadTheme(url, name) {
  const pathToThemes = path.join(config.root, config.themes.path)
  const PathToTmpTheme = path.join(pathToThemes, 'tmp-download')
  mkdirp.sync(PathToTmpTheme)

  const p = new Promise((resolve) => {
    const pathToZip = path.join(PathToTmpTheme, name+'.zip')
    const writeStream = fse.createWriteStream(pathToZip)

    request(url)
      .on('response', (res) => {})
      .on('error', (res) => {
        resolve({res: 'ko', 'error': res})
      })
      .on('end', (res) => {})
      .pipe(writeStream)
      writeStream.on('finish', function() {
        extract(pathToZip, {dir: PathToTmpTheme}, function (err) {

          const dirs = coreUtils.file.getFoldersSync(PathToTmpTheme, false)
          const currentPathToTheme = dirs[0].path
          fse.renameSync(currentPathToTheme, path.join(pathToThemes, name))

          fse.remove(PathToTmpTheme, err => {
            if (err) return console.error(err)
          })

          if(err != null) {
            console.log(err)
            resolve({res: 'ko', 'error': 'err'})
            return
          }

          let json = config.getLocalConfig()
          json.themes = {
            name:name
          }
          config.save(json)
          cmsTemplates.assets.copy()
          getThemeInfos().then((json) =>  {
            resolve({success: 'ok', theme: json})
          })
        })
      })
  }).catch(function(e) {
    resolve({res: 'ko', 'error': e})
    console.error(e)
  })

  return p
}
