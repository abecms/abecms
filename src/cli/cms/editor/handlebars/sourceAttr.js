export function isSelected(value, display, str) {
  var selected = false

  var pDisplay = prepareDisplay(value, str)
  if (pDisplay === display) {
    selected = true
  }

  return selected
}

export default function sourceAttr(obj, params) {
  var str = params.display
  var selected = ''
  var displayName = prepareDisplay(obj, str)
  var values = params.value
  if(Object.prototype.toString.call(params.value) !== '[object Array]') {
    values = [params.value]
  }

  if (params.multiple != 'multiple') {
    Array.prototype.forEach.call(values, (pValue) => {
      if (isSelected(pValue, displayName, str)) {
        selected = 'selected'
      }
    })
  }

  return {
    hiddenVal: (typeof obj == 'object') ? JSON.stringify(obj).replace(/\'/g, '&quote;') : obj,
    selected: selected,
    val: displayName
  }
}

/**
 * return the value from a json obj of a nested attribute
 * @param  {Object} obj  the json object
 * @param  {string} path the path to object (dot notation)
 * @return {[type]}      the object containing the path object or undefined
 */
export function get(obj, path) {
  if (path == null) {
    return obj
  }
  return path.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : undefined
  }, obj || this)
}

/**
 * replace the variables in str by values from obj
 * corresponding to keys
 * @param  {Object} obj    the json object
 * @param  {string} str    the string
 * @return {string}        the string with values
 */
export function prepareDisplay(obj, str = null) {
  var keys = getKeys(str)
  Array.prototype.forEach.call(keys, (key) => {
    var val = get(obj, key)

    var pattern = new RegExp('{{'+key+'}}|'+key, 'g')
    str = str.replace(pattern, val)
  })
    // console.log('params.value', params.value)

  if (str == null) {
    str = obj
  }

  return str
}

/**
 * return array of variables {{variable}} extracted from str
 * @param  {string} str the string containing variables
 * @return {Array}     the array of variables
 */
export function getKeys(str){
  var regex = /\{\{(.*?)\}\}/g
  var variables = []
  var match

  while ((match = regex.exec(str)) !== null) {
    if (match[1] != null) {
      variables.push(match[1])
    }
  }
  
  if (variables.length == 0 && str != null) {
    variables.push(str)
  }

  return variables
}
