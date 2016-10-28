/**
 * Handlebars helper, lowercase the str
 */
export default function lowercase(str) {
  if(typeof str === 'undefined' || str === null){
    return ''
  } else {
    return str.toLowerCase()
  }
}