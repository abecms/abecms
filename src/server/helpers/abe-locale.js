import fse from 'fs-extra'
import extend from 'extend'
import path from 'path'

import {
  config
} from '../../cli'

var result = {}

var pathToLocale = path.join(__dirname, '../' + config.localeFolder, config.intlData.locales)
var files = fse.readdirSync(pathToLocale)

Array.prototype.forEach.call(files, (file) => {
  var json = fse.readJsonSync(pathToLocale + '/' + file)
  result = extend(true, result, json)
})

if(config.siteLocaleFolder != null){
  var pathToSiteLocale = path.join(config.root, config.siteLocaleFolder, config.intlData.locales)
  var files = fse.readdirSync(pathToSiteLocale)
  Array.prototype.forEach.call(files, (file) => {
  	var json = fse.readJsonSync(pathToSiteLocale + '/' + file)
  	result = extend(true, result, json)
  })
}

export default result