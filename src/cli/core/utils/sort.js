export function byDateDesc(a, b) {
  var dateA = new Date(a.date)
  var dateB = new Date(b.date)
  if(dateA < dateB) {
    return 1
  }else if(dateA > dateB) {
    return -1
  }
  return 0
}

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

export function byDateAsc(a, b) {
  var dateA = new Date(a.date)
  var dateB = new Date(b.date)
  if(dateA > dateB) {
    return 1
  }else if(dateA < dateB) {
    return -1
  }
  return 0
}