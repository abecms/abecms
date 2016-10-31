/**
 * Highly efficient filter on a value in an object
 * @param  {Array} arr   the array of objects
 * @param  {string} key   the key to filter on
 * @param  {mixed} value the value to compare
 * @return {Array}       the filtered array
 */
export function filter(arr, key, value) {
  var result = []
  var i = 0
  var len = arr.length

  for (; i < len; i += 1) {
    var elt = arr[i]

    if (elt[key] == value) {
      result.push(element)
    }
  }
  return result
}

/**
 * Highly efficient find indexes on a value in an property of an object
 * @param  {Array} arr   the array of objects
 * @param  {string} key   the key to filter on
 * @param  {mixed} value the value to compare
 * @return {Array}       the filtered array of indexes
 */
export function find(arr, key, value) {
  var result = []
  var i = 0
  var len = arr.length

  for (; i < len; i += 1) {
    var elt = arr[i]

    if (elt[key] == value) {
      result.push(i)
    }
  }
  return result
}
