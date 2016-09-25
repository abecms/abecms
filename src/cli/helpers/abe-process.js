import process from 'child_process'

import {
  config
} from '../'

function prepend(value, array) {
    var newArray = array.slice(0)
    newArray.unshift(value)
    return newArray
}

var abeProcess = function(name, args) {
    args = prepend(`ABE_WEBSITE=${config.root}`, args)
    var publishAll = process.fork(`${__dirname}/../../cli/process/${name}.js`, args)
}

export default abeProcess