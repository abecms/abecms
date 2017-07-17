import {abeExtend} from '../../'
import * as sourceAttr from '../../cms/editor/handlebars/sourceAttr'
/**
* Get All attributes from a Abe tag
* @return {Object} parsed attributes
*/
export function getAll(str, json) {
  str = abeExtend.hooks.instance.trigger('beforeAbeAttributes', str, json)

  //This regex analyzes all attributes of a Abe tag
  var re = /\b([a-z][a-z0-9\-]*)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/gi

  var attrs = {
    autocomplete: null,
    desc: '',
    hint: '',
    display: null,
    editable: true,
    key: '',
    'max-length': null,
    'min-length': 0,
    order: 0,
    prefill: false,
    'prefill-quantity': null,
    reload: false,
    required: false,
    source: null,
    tab: 'default',
    type: 'text',
    value: null,
    file: '',
    visible: true
  }

  for (var match; (match = re.exec(str)); ) {
    attrs[match[1]] = match[3] || match[4] || match[5]
  }

  attrs.sourceString = attrs.source
  attrs.source = attrs.source
    ? json != null && json['abe_source'] != null
      ? json['abe_source'][attrs.key]
      : null
    : null
  attrs.editable = attrs.editable && attrs.editable !== 'false' ? true : false

  attrs = abeExtend.hooks.instance.trigger(
    'afterAbeAttributes',
    attrs,
    str,
    json
  )

  return attrs
}

export function sanitizeSourceAttribute(obj, jsonPage) {
  if (obj.sourceString != null && obj.sourceString.indexOf('{{') > -1) {
    var matches = obj.sourceString.match(/({{[a-zA-Z._]+}})/g)
    if (matches !== null) {
      Array.prototype.forEach.call(matches, match => {
        var val = match.replace('{{', '')
        val = val.replace('}}', '')

        try {
          val = eval('jsonPage.' + val)
        } catch (e) {
          val = ''
        }
        obj.sourceString = obj.sourceString.replace(match, val)
      })
    }
  }

  return obj
}

/**
 * This function will take the value of an Abe attribute and analyze its content.
 * If it contains a var {{variable.prop.value}}, it will extract its content with these rules
 * element.[0].value
 * element[0].value
 * element.0.value
 * will all be transformed into element[0].value and evaluated with the json
 * If it contains a [] ie. {{variable[].value}} or {{variable.[].value}}
 * It will return the array of values
 * @param  {String} value 
 * @return {String}       
 */
export function getValueFromAttribute(value, json) {
  var result = value
  if (value.indexOf('{{') > -1) {
    var keys = sourceAttr.getKeys(value)
    var isAr = false
    Array.prototype.forEach.call(keys, key => {
      var toEval = `${key.replace(/(\[|\.|\])/g, '\\$1')}`
      var properties = key.split('.')
      Array.prototype.forEach.call(properties, (prop, index) => {
        if (prop.indexOf('[]') > 0) {
          isAr = true
        } else if (prop.indexOf('[]') == 0 && index > 0) {
          properties[index - 1] += prop
          properties.splice(index, 1)
          isAr = true
        } else if (prop.indexOf('[') == 0 && index > 0) {
          properties[index - 1] += prop
          properties.splice(index, 1)
        } else if (/^\d+$/.test(prop) && index > 0) {
          properties[index - 1] += '[' + prop + ']'
          properties.splice(index, 1)
        }
      })
      key = properties.join('.')
      try {
        if (isAr) {
          result = []
          var properties = key.split('[]')
          var jsonAr = eval(`json.${properties[0]}`)
          Array.prototype.forEach.call(jsonAr, (prop, index) => {
            var resTemp = value
            result.push(
              resTemp.replace(
                new RegExp(`\{\{${toEval}\}\}`, 'g'),
                eval(`prop${properties[1]}`)
              )
            )
          })
        } else {
          result = result.replace(
            new RegExp(`\{\{${toEval}\}\}`, 'g'),
            eval(`json.${key}`)
          )
        }
      } catch (e) {}
    })
  }

  return result
}
