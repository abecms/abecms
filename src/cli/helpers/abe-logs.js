import fse from 'fs-extra'
import prettyjson from 'prettyjson'
import Table from 'cli-table'
import mkdirp from 'mkdirp'
import fs from 'fs'
import clc from 'cli-color'
import path from 'path'
import {config, fileUtils} from '../'

export default class Logs {

  constructor() {

  }

  static cleanPath(pathClean) {
    if(typeof pathClean !== 'undefined' && pathClean !== null) {
			// console.log('cleanPath', path)
      pathClean = pathClean.replace(/\/$/, '')
    }
    return pathClean
  }

  static removeLast(pathRemove) {
    return pathRemove.substring(0, Logs.cleanPath(pathRemove).lastIndexOf('/'))
  }

  static table(arr) {
    var vertical = {}

		// instantiate
    var tab = new Table()

    var i = '0'
    Array.prototype.forEach.call(arr, (value) => {
      var obj = {}
      obj['item-' + (i++)] = value
      tab.push(obj)
    })

    return tab.toString()
  }

  static json(obj) {
    return prettyjson.render(obj)
  }

  static text() {
    var res = ''

    if(arguments.length > 0) {
      var args = [].slice.call(arguments)
      args.shift()

      Array.prototype.forEach.call(args, (arg) => {
				
        if(typeof arg === 'object' && Object.prototype.toString.call(args) === '[object Array]') {
          res += JSON.stringify(arg, null, 2) + '\n'
        }else if(typeof arg === 'object' && Object.prototype.toString.call(args) === '[object Object]') {
          res += JSON.stringify(arg, null, 2) + '\n'
        }else {
          res += arg + '\n'
        }
      })

      return res
    }
  }

  static getType() {
    var res = ''

    if(arguments.length > 0) {
      var args = [].slice.call(arguments)
      return args[0]
    }
    return 'default'
  }

  static error() {
    var type = Logs.getType.apply(this, arguments)
    var msg = `[ ERROR ${type} ]\n` + Logs.text.apply(this, arguments)
    console.log(clc.red(msg))
    var pathError = path.join(config.root, '/logs/ERROR-' + Logs.getType.apply(this, arguments) + '.log')
    Logs.writeFile(pathError, msg, 'a+')
  }

  static duration(str, time) {
    if(typeof config.logs !== 'undefined' && config.logs !== null
			&& config.logs === true) {
      var pathDuration = path.join(config.root, '/logs/duration.log')
      var durationColor = '#B2FF59'
      if (time > 5) {
        durationColor = '#ff003b'
      }else if (time > 1) {
        durationColor = '#ffbc00'
      }
      Logs.writeFile(pathDuration, str + ' in <span style="color: ' + durationColor + ';">' + time + '</span>\n', 'a+')
    }
  }

  static write() {
    if(typeof config.logs !== 'undefined' && config.logs !== null
			&& config.logs === true) {
      var pathWrite = path.join(config.root, '/logs/' + Logs.getType.apply(this, arguments) + '.log')
      Logs.writeFile(pathWrite, Logs.text.apply(this, arguments), 'a+')
    }
  }

  static delAndWrite() {
    if(typeof config.logs !== 'undefined' && config.logs !== null
			&& config.logs === true) {
      var pathWrite = path.join(config.root, '/logs/' + Logs.getType.apply(this, arguments) + '.log')
      Logs.writeFile(pathWrite, Logs.text.apply(this, arguments), 'w')
    }
  }

  static writeFile(file, data, flag) {
    if(typeof config.logs !== 'undefined' && config.logs !== null
			&& config.logs === true) {
      data = new Date().toString() + ' --- ' + data
      mkdirp.sync(Logs.removeLast(file))
      fs.writeFileSync(file, data, {encoding: 'utf8', flag: flag})
    }
  }
}