/**
 * Highly efficient filter on a value in an object
 * @param  {Array} arr   the array of objects
 * @param  {string} attr the attribute to filter on
 * @param  {mixed} value the value to compare
 * @return {Array}       the filtered array
 */
export function filter(arr, attr, value) {
  const len = arr.length
  let result = []
  let i = 0

  for (; i < len; i += 1) {
    let elt = arr[i]

    if (elt[attr] == value) {
      result.push(elt)
    }
  }
  return result
}

/**
 * Highly efficient facet on a value in an object
 * Works also for nested properties
 * @param  {Array} arr   the array of objects to search
 * @param  {Array} attrs the attributes to facet on
 * @param  {mixed} value the value to compare
 * @return {Array}       the filtered array
 */
export function facet(arr, attrs, value) {
  let searches = []
  Array.prototype.forEach.call(attrs, attr => {
    let attrPath = attr.split('.')
    searches.push(attrPath)
  })

  const len = arr.length
  let result = []
  let i = 0

  for (; i < len; i += 1) {
    let elt = arr[i]
    let found = false
    Array.prototype.forEach.call(searches, search => {
      let j = 0
      let a = arr[i]
      while (j < search.length) {
        a = a[search[j]]
        j++
      }
      if (a.indexOf(value) !== -1) {
        found = true
      }
    })

    if (found) {
      result.push(elt)
    }
  }

  return result
}

/**
 * Highly efficient find indexes on a value in a property of an object
 * Works also for nested properties
 * @param  {Array} arr   the array of objects
 * @param  {string} attr the attribute to filter on
 * @param  {mixed} value the value to compare
 * @return {Array}       the filtered array of indexes
 */
export function find(arr, attr, value) {
  const len = arr.length
  let result = []
  let i = 0

  for (; i < len; i += 1) {
    let elt = arr[i]

    if (elt[attr] == value) {
      result.push(i)
    }
  }
  return result
}

/**
 * Remove objects from an array given an attribute value
 * @param  {Array} arr   the array of objects
 * @param  {string} attr the attribute to filter on
 * @param  {mixed} value the value to compare
 * @return {Array}       the array with corresponding objects removed
 */
export function removeByAttr(arr, attr, value) {
  let i = arr.length
  while (i--) {
    if (
      arr[i] &&
      arr[i].hasOwnProperty(attr) &&
      (arguments.length > 2 && arr[i][attr] === value)
    ) {
      arr.splice(i, 1)
    }
  }

  return arr
}

export function contains(arr, obj) {
  var i = arr.length
  while (i--) {
    if (arr[i] === obj) {
      return true
    }
  }
  return false
}
