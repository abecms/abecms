import path from 'path'
import fse from 'fs-extra'
import request from 'request'
import extract from 'extract-zip'

import {
  config,
  cmsTemplates
} from '../../'

export function getThemeName(url) {
  var name = url.split('/')

  return name[name.length - 1].replace('.zip')
}

export function getThemeInfos() {
  var pathToSite = path.join(config.root, config.templates.url)

  var p = new Promise((resolve) => {
    fse.readJson(path.join(pathToSite,'theme.json'), (err, json) => {
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
  var pathToSite = path.join(config.root, config.templates.url)
  fse.readJson(path.join(pathToSite,'theme.json'), (err, json) => {
    if (err) console.error(err)
    if(json != null && json.theme != null && json.theme.root_files != null){
      Array.prototype.forEach.call(json.theme.root_files, (file) => {
        fse.remove(path.join(pathToSite, file), err => {
          if (err) console.error(err)
        })
      })
    }
  })
}

export function downloadTheme(url) {
  var pathToSite = path.join(config.root, config.templates.url)
  var p = new Promise((resolve) => {
    var pathToZip = path.join(pathToSite, 'theme.zip')

    var writeStream = fse.createWriteStream(pathToZip)
    request(url)
      .on('response', (res) => {})
      .on('error', (res) => {
        resolve({res: 'ko', 'error': res})
      })
      .on('end', (res) => {})
      .pipe(writeStream)
      writeStream.on('finish', function() {
        extract(pathToZip, {dir: pathToSite}, function (err) {
          fse.remove(pathToZip, err => {
            if (err) return console.error(err)
          })

          if(err != null) {
            console.log(err)
            resolve({res: 'ko', 'error': 'err'})
            return
          }
          getThemeInfos().then((json) =>  {
            cmsTemplates.assets.copy()
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
