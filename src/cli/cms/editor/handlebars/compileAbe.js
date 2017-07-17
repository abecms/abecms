import Handlebars from 'handlebars'
import abeEngine from './abeEngine'
import xss from 'xss'

import {config} from '../../../'

/**
 * Abe handlebar helper, that retrieve text to add to handlebars templating engine
 * @return {String} the string to replace {{ handlebars_key }}
 */
export default function compileAbe() {
  var content = abeEngine.instance.content
  if (arguments[0].hash['key'] == null) return ''
  var key
  var hash
  var value
  var testXSS

  if (arguments[0].hash['key'].indexOf('}-') > 0) {
    key = arguments[0].hash['key'].split('-')
    key = key[key.length - 1]
    hash = arguments[0].hash
    // hash.key = hash.key.replace(/\{\{@index\}\}/, '[{{@index}}]')
    hash.key = hash.key.replace(
      /\{\{@index\}\}/,
      `[${arguments[0].data.index}]`
    )
    try {
      value = content
        ? eval(
            `content["${hash.dictionnary}"][${arguments[0].data
              .index}]["${key}"]`
          )
        : hash.key
      // value = content ? content[hash['dictionnary']][arguments[0].data.index][key] : hash.key
    } catch (e) {
      console.log(e.stack)
      value = ''
    }
    if (typeof value === 'function' || value == null) {
      value = hash.value != null ? hash.value : ''
    }
    if (hash.type != null && (hash.type === 'rich' || hash.type === 'code')) {
      if (config.xss) {
        testXSS = xss(value.replace(/&quot;/g, '"'), {
          whiteList: config.htmlWhiteList,
          stripIgnoreTag: true
        })
        return new Handlebars.SafeString(testXSS)
      } else {
        return new Handlebars.SafeString(value.replace(/&quot;/g, '"'))
      }
    }

    return value.replace(/%27/, "'")
  }

  key = arguments[0].hash['key'].replace('.', '-')

  hash = arguments[0].hash
  if (content) {
    try {
      if (hash.key.indexOf('.') > -1)
        value = eval(`content["${hash.key.split('.').join('"]["')}"]`)
      else value = eval(`content["${hash.key}"]`)
    } catch (e) {
      value = ''
    }
  } else {
    value = hash.key
  }

  if (typeof value === 'function' || value == null) {
    value = hash.value != null ? hash.value : ''
  }

  if (hash.type != null && (hash.type === 'rich' || hash.type === 'code')) {
    if (config.xss) {
      testXSS = xss(value.replace(/&quot;/g, '"'), {
        whiteList: config.htmlWhiteList,
        stripIgnoreTag: true
      })
      return new Handlebars.SafeString(testXSS)
    } else {
      return new Handlebars.SafeString(value.replace(/&quot;/g, '"'))
    }
  }

  return value.replace(/%27/, "'")
}
