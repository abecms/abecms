import process from 'child_process'
import fse from 'fs-extra'

import {
  config
  ,Plugins
} from '../'

function prepend(value, array) {
  var newArray = array.slice(0)
  newArray.unshift(value)
  return newArray
}

var abeProcess = function(name, args = []) {
  args = prepend(`ABE_WEBSITE=${config.root}`, args)

  var file = `${__dirname}/../../cli/process/${name}.js`
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
  console.log('file', file)
  try {
		var stats = fse.statSync(file)
		if (stats.isFile()) {
			process.fork(file, args)
		}
	}catch(err) {
		file = Plugins.instance.getProcess(name)
		var stats = fse.statSync(file)
		if (stats.isFile()) {
			process.fork(file, args)
		}
	}
}

export default abeProcess