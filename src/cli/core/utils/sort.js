/**
 * sort an array of objects by date attribute
 *
 * Example : [{date: date}, {date: date}].sort(coreUtils.sort.byDateDesc)
 * 
 * @param  {Object} a object with date attribute
 * @param  {Object} b object with date attribute
 * @return {Int}   1 | 0 | -1
 */
export function byDateDesc(a, b) {
  var dateA = (a.abe_meta.publish != null) ? new Date(a.abe_meta.publish.date) : 0
  var dateB = (b.abe_meta.publish != null) ? new Date(b.abe_meta.publish.date) : 0
  if(dateA < dateB) {
    return 1
  }else if(dateA > dateB) {
    return -1
  }
  return 0
}

/**
 * shuffle an array of objects by date attribute
 *
 * Example : var shuffledArray = coreUtils.sort.shuffle([Object}, Object])
 * 
 * @param  {Array} array
 * @return {Array} array
 */
export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}
/**
 * sort an array of objects by date attribute
 *
 * Example : [{date: date}, {date: date}].sort(coreUtils.sort.byDateAsc)
 * 
 * @param  {Object} a object with date attribute
 * @param  {Object} b object with date attribute
 * @return {Int}   1 | 0 | -1
 */
export function byDateAsc(a, b) {
  var dateA = (a.abe_meta.publish != null) ? new Date(a.abe_meta.publish.date) : 0
  var dateB = (b.abe_meta.publish != null) ? new Date(b.abe_meta.publish.date) : 0
  if(dateA > dateB) {
    return 1
  }else if(dateA < dateB) {
    return -1
  }
  return 0
}

/**
 * This function makes sorting on an array of Json objects possible.
 * Pass the property to be sorted on.
 * Usage: myArray.sort(coreUtils.sort.predicatBy('date',-1));
 * @param  String prop  the json property to sort on
 * @param  integer order order ASC if 1, DESC if -1
 * @return integer the ordered value
 */
export function predicatBy(prop, order){
  if (order !== -1) {
    order = 1
  }
  if(prop === 'date'){
    return function(a,b){
      a = new Date(a[prop])
      b = new Date(b[prop])
      if( a > b){
        return 1*order
      }else if( a < b ){
        return -1*order
      }
      return 0
    }
  }

  return function(a,b){
    if( a[prop] > b[prop]){
      return 1*order
    }else if( a[prop] < b[prop] ){
      return -1*order
    }
    return 0
  }
}