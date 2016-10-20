import clc from 'cli-color'
import path from 'path'
import fse from 'fs-extra'

// ./node_modules/.bin/babel-node src/cli/process/publish-all.js ABE_WEBSITE=/path/to/website
// ./node_modules/.bin/babel-node src/cli/process/publish-all.js FILEPATH=/path/to/website/path/to/file.html ABE_WEBSITE=/path/to/website
var pConfig = {}
Array.prototype.forEach.call(process.argv, (item) => {
  if (item.indexOf('=') > -1) {
    var ar = item.split('=')
    pConfig[ar[0]] = ar[1]
  }
})

if(typeof pConfig.ABE_PATH === 'undefined' || pConfig.ABE_PATH === null) {
  pConfig.ABE_PATH = ''
}

console.log(clc.green('start publish all') + ' path ' + pConfig.ABE_PATH)

function msToTime(duration) {
  var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24)

  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds
}

function publishNext(published, tt, cb, i = 0) {
  var currentDateStart = new Date()
  var pub = published.shift()
  if(typeof pub !== 'undefined' && pub !== null) {
    
    var json = cmsData.file.get(pub.path)
    if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
      i++

      var p = new Promise((resolve) => {
        try {
          
          cmsOperations.save.save(
            pub.path,
            json.abe_meta.template,
            null,
            '',
            'publish',
            null,
            'publish',
            true)
            .then(() => {
              var d = new Date(new Date().getTime() - currentDateStart.getTime())
              var total = new Date(new Date().getTime() - dateStart.getTime())
              // logsPub += i + ' [' + d + 'sec] > start publishing ' + pub.path .replace(config.root, '') + ' < ' + pub.path
              console.log(clc.green(i) + '/' + tt + ' - (' + clc.green(msToTime(d)) + '/' + msToTime(total) + ')')
              console.log(clc.bgWhite(clc.black(pub.path.replace(config.root, '').replace(config.data.url, '')))
                + ' (' + clc.cyan(json.abe_meta.template) + ')')
              resolve()
            }).catch(function(e) {
              var d = new Date(new Date().getTime() - currentDateStart.getTime())
              var total = new Date(new Date().getTime() - dateStart.getTime())
              console.log(clc.red(i) + '/' + tt + ' - (' + clc.red(msToTime(d)) + '/' + msToTime(total) + ')')
              publishErrors.push({
                msg: e + ''
                , json:json
              })
              console.log(clc.red(e))
              console.log('publish-all', 'ERROR on ' + pub.path.replace(config.root, '').replace(config.data.url, ''))
              resolve()
            })
        } catch(e) {
          console.log(clc.red('cannot save') + ' ' + pub.path)
          resolve()
        }
      })
    }

    p.then(function () {
      publishNext(published, tt, cb, i++)
    })
    .catch(function (e) {
      publishNext(published, tt, cb, i++)
      console.log('error', clc.red(e))
    })
  }else {
    cb(i)
  }
}

var publishErrors = []
var dateStart = new Date()
// var logsPub = ""
if(typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  var config = require('../../cli').config
  if(pConfig.ABE_WEBSITE) config.set({root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/'})
  try {
    var cmsData = require('../../cli').cmsData
    var cmsOperations = require('../../cli').cmsOperations
    var Manager = require('../../cli').Manager

    Manager.instance.init()
      .then(() => {
        var files = Manager.instance.getList()

        // var result = []
        var published = []
        var folderToParse = path.join(config.root, config.data.url, pConfig.ABE_PATH)
        Array.prototype.forEach.call(files, (file) => {
          if (typeof file.publish !== 'undefined' && file.publish !== null && file.path.indexOf(folderToParse) > -1) {
            published.push(file)
          }
        })

        console.log('Found ' + clc.green(published.length) + ' to republish')

        dateStart = new Date()
        publishNext(published, published.length, function (i) {
          console.log('total ' + clc.green(i) + ' files')
          if (publishErrors.length > 0) {
            var errorPath = path.join(config.root, 'abe-publish-all.' + dateStart.getTime() + '.log')
            console.log('Errors ' + clc.red(publishErrors.length) + ' see ' + errorPath + ' for more info')
            fse.writeJsonSync(errorPath, publishErrors, {
              space: 2,
              encoding: 'utf-8'
            })
          }
          dateStart = (Math.round((new Date().getTime() - dateStart.getTime()) / 1000 / 60 * 100)) / 100
          console.log('publish process finished in ' + clc.green(dateStart) + 'm')
          process.send('finished');
          process.exit(0);
        })
      })
      .catch((e) => {
        console.log('publish-all', e)
      })

  } catch(e) {
    console.log('publish-all', e)
  }

}else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website')
  process.exit(0)
}