import Handlebars from 'handlebars'
import abeEngine from './abeEngine'
import xss from 'xss'

import {
  config
} from '../../../'

/**
 * Abe handlebar helper, that retrieve text to add to handlebars templating engine
 * @return {String} the string to replace {{ handlebars_key }}
 */
export default function compileAbe(){
  var content = abeEngine.instance.content
  if(arguments[0].hash['key'] == null) return ''
  var key
  var hash
  var value
  var testXSS
  
  if(arguments[0].hash['key'].indexOf('}-') > 0){
    key = arguments[0].hash['key'].split('-')
    key = key[key.length - 1]
    hash = arguments[0].hash
    hash.key = hash.key.replace(/\{\{@index\}\}/, '[{{@index}}]')
    try{
      value = content ? content[hash['dictionnary']][arguments[0].data.index][key] : hash.key
    }
    catch(e){
      value = ''
    }
    if(typeof value === 'function' || value == null) {
      value = ''
    }
    if(hash.type != null && hash.type === 'rich'){
      testXSS = xss(value.replace(/&quot;/g, '"'), {
        'whiteList': config.htmlWhiteList,
        stripIgnoreTag: true
      })
      return new Handlebars.SafeString(testXSS)
    }
    return value.replace(/%27/, '\'')
  }

  key = arguments[0].hash['key'].replace('.', '-')

  hash = arguments[0].hash
  value = ((content) ? content[hash.key.replace('.', '-')] : hash.key)
  if(typeof value === 'function' || value == null) {
    value = ''
  }
  
  if(hash.type != null && hash.type === 'rich'){
    testXSS = xss(value.replace(/&quot;/g, '"'), {
      'whiteList': config.htmlWhiteList,
      stripIgnoreTag: true
    })
    return new Handlebars.SafeString(testXSS)
  }
  return value.replace(/%27/, '\'')
}
