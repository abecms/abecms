export function setObjByString(obj, str, val) {
  var keys, key
  //make sure str is a string with length
  if (!str || !str.length || Object.prototype.toString.call(str) !== '[object String]') {
    return false
  }
  if (obj !== Object(obj)) {
      //if it's not an object, make it one 
    obj = {}
  }
  keys = str.split('.')
  while (keys.length > 1) {
    key = keys.shift()
    if (obj !== Object(obj)) {
          //if it's not an object, make it one 
      obj = {}
    }
    if (!(key in obj)) {
          //if obj doesn't contain the key, add it and set it to an empty object 
      obj[key] = {}
    }
    obj = obj[key]
  }
  return obj[keys[0]] = val
}