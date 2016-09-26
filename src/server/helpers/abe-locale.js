import fse from 'fs-extra'
import extend from 'extend'
import clc from 'cli-color'
import path from 'path'

import {
	cli,
	FileParser,
	fileUtils,
	config,
	log
} from '../../cli'

var result = {}

var pathToLocale = path.join(__dirname, '../' + config.localeFolder, config.intlData.locales)
var files = fse.readdirSync(pathToLocale)

Array.prototype.forEach.call(files, (file) => {
  var json = fse.readJsonSync(pathToLocale + '/' + file)
  result = extend(true, result, json)
})

export default result
