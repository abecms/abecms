import clc from 'cli-color'

// ./node_modules/.bin/babel-node src/cli/process/publish-all.js ABE_WEBSITE=/path/to/website
// ./node_modules/.bin/babel-node src/cli/process/publish-all.js FILEPATH=/path/to/website/path/to/file.html ABE_WEBSITE=/path/to/website
var pConfig = {}
Array.prototype.forEach.call(process.argv, (item) => {
  if (item.indexOf('=') > -1) {
    var ar = item.split('=')
    pConfig[ar[0]] = ar[1]
  }
})

pConfig.TYPE = pConfig.TYPE || 'publish';

if(typeof pConfig.ABE_PATH === 'undefined' || pConfig.ABE_PATH === null) {
  pConfig.ABE_PATH = ''
}

console.log(clc.green('start publish all') + ' path ' + pConfig.ABE_PATH)

function publishNext(published, cb, i = 0) {
  var currentDateStart = new Date()
  var pub = published.shift()
  if(typeof pub !== 'undefined' && pub !== null) {
      
    var jsonPath = FileParser.changePathEnv(pub.path, config.data.url).replace(new RegExp("\\." + config.files.templates.extension), '.json')
    var json = FileParser.getJson(jsonPath)
    if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
      i++
      ar_url.push(pub.path)

      var p = new Promise((resolve, reject) => {
        save(
          pub.path,
          json.abe_meta.template,
          null,
          '',
          pConfig.TYPE,
          null,
          pConfig.TYPE,
          true)
          .then(() => {
            var d = (new Date().getTime() - currentDateStart.getTime()) / 1000
            var total = (Math.round((new Date().getTime() - dateStart.getTime()) / 1000 / 60 * 100)) / 100
            // logsPub += i + ' [' + d + 'sec] > start publishing ' + pub.path .replace(config.root, '') + ' < ' + jsonPath
            console.log(i + ' - (' + clc.green(d + 's') + ' / ' + total + 'm)')
            console.log(clc.bgWhite(clc.black(pub.path.replace(config.root, '')))
              + ' < ' + clc.bgWhite(clc.black(jsonPath.replace(config.root, '')))
              + ' (' + clc.cyan(json.abe_meta.template) + ')')
            resolve()
          }).catch(function(e) {
            // log.write('publish-all', e)
            console.log('publish-all', e)
            // log.write('publish-all', 'ERROR on ' + pub.path .replace(config.root, ''))
            console.log('publish-all', 'ERROR on ' + pub.path .replace(config.root, ''))
            resolve()
          })
      })
    }

    p.then(function () {
       publishNext(published, cb, i++)
    })
    .catch(function () {
       console.log('error', clc.red(e))
    })
  }else {
    cb(i)
  }
}

var dateStart = new Date()
// var logsPub = ""
if(typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  var config = require('../../cli').config
  if(pConfig.ABE_WEBSITE) config.set({root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/'})
  try {

    // require controller to instanciate hooks
    var controllers = require('../../server/controllers')
    var FileParser = require('../../cli').FileParser
    var fileUtils = require('../../cli').fileUtils
    var folderUtils = require('../../cli').folderUtils
    var save = require('../../cli').save
    var log = require('../../cli').log
    var Manager = require('../../cli').Manager

    Manager.instance;

    var type = null
    var folder = null
    if(typeof pConfig.FILEPATH !== 'undefined' && pConfig.FILEPATH !== null) {
      // log.write('publish-all', 'started by < ' + pConfig.FILEPATH.replace(config.root, ''))
      console.log('publish-all', 'started by < ' + pConfig.FILEPATH.replace(config.root, ''))
      pConfig.FILEPATH = fileUtils.concatPath(config.root, config.data.url, pConfig.FILEPATH.replace(config.root))

      var fileJson = FileParser.getJson(
        pConfig.FILEPATH.replace(new RegExp("\\." + config.files.templates.extension), '.json')
      )

      if(typeof fileJson !== 'undefined' && fileJson !== null) {
        if(typeof fileJson.abe_meta !== 'undefined' && fileJson.abe_meta !== null) {
          type = fileJson.abe_meta.template
          folder = fileUtils.removeLast(fileJson.abe_meta.link)
        }
      }
    }

    var site = folderUtils.folderInfos(config.root)
    var allPublished = []

    let publish = config.publish.url
    var published = FileParser.getFilesByType(fileUtils.concatPath(site.path, publish, pConfig.ABE_PATH))
    published = FileParser.getMetas(published, 'draft')
    var ar_url = []
    var promises = []
    var i = 0

    dateStart = new Date()
    publishNext(published, function (i) {
      console.log('total ' + clc.green(i) + ' files')

      // Promise.all(promises)
      //   .then(() => {
          dateStart = (Math.round((new Date().getTime() - dateStart.getTime()) / 1000 / 60 * 100)) / 100
          // logsPub += 'publish process finished in ' + dateStart + 'sec'
          console.log('publish process finished in ' + clc.green(dateStart) + 'm')
          // log.write('publish-all', logsPub)
          // console.log('publish-all', logsPub)
          process.exit(0)
        // }).catch(function(e) {
        //   // log.write('publish-all', e)
        //   console.log('publish-all', e)
        //   console.log(e)
        // })
    })
  } catch(e) {
    // statements
    console.log(e);
    // log.write('publish-all', e)
    console.log('publish-all', e)
  }

}else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website')
  process.exit(0)
}