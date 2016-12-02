export function isSelected(currentValue, values) {
  var isEqual = false
  if(typeof currentValue === 'object' && Object.prototype.toString.call(currentValue) === '[object Object]') {
    Array.prototype.forEach.call(values, (value) => {
      if (value != null) {
        var checkAllEqual = false
        Array.prototype.forEach.call(Object.keys(value), (key) => {
          if (currentValue[key] != null && currentValue[key] == value[key] && checkAllEqual == false) {
            checkAllEqual = true
          }
        })
        if (checkAllEqual) {
          isEqual = true
        }
      }
    })
  }else {
    Array.prototype.forEach.call(values, (value) => {
      if (currentValue == value) {
        isEqual = true
      }
    })
  }

  return isEqual
}

export default function sourceAttr(obj, params) {
  var str = params.display
  var selected = ''
  var displayName = prepareDisplay(obj, str)
  if (params.value === displayName) {
    selected = 'selected'
  }

  return {
    hiddenVal: JSON.stringify(obj).replace(/\'/g, '&quote;'),
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
    var pattern = new RegExp('{{'+key+'}}|'+key)
    str = str.replace(pattern, val)
  })

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
