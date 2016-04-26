import Handlebars from 'handlebars'
import abeEngine from './abeEngine'

/**
 * Abe handlebar helper, that retrieve text to add to handlebars templating engine
 * @return {String} the string to replace {{ handlebars_key }}
 */
export default function compileAbe(){
  var content = abeEngine.instance.content
  if(typeof arguments[0].hash['key'] === 'undefined' || arguments[0].hash['key'] === null) return '';
  if(arguments[0].hash['key'].indexOf('}-') > 0){
    var key = arguments[0].hash['key'].split('-')
    key = key[key.length - 1]
    var hash = arguments[0].hash
    hash.key = hash.key.replace(/\{\{@index\}\}/, '[{{@index}}]')
    return (content) ? content[hash['dictionnary']][arguments[0].data.index][key] : hash.key
  }

  var key = arguments[0].hash['key'].replace('.', '-')

  var hash = arguments[0].hash
  var value = (content) ? content[hash.key.replace('.', '-')] : hash.key
  if(typeof value === 'undefined' || value === null) {
    value = ''
  }
  return value
}
