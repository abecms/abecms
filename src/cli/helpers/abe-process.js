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
  args = prepend(`ABEJS_PATH=${__dirname}/../../../dist`, args)

  var file = `${__dirname}/../../cli/process/${name}.js`
  try {
		var stats = fse.statSync(file)
		if (stats.isFile()) {
			process.fork(file, args)
		}
	}catch(err) {
		try {
			file = Plugins.instance.getProcess(name)
			var stats = fse.statSync(file)
			if (stats.isFile()) {
				process.fork(file, args)
			}
		}catch(err) {
			
		}
	}
}

export default abeProcess