/**
 * Handlebars helper, uppercase the str
 */
export default function uppercase(str) {
  if (typeof str === 'undefined' || str === null) {
    return ''
  } else {
    return str.toUpperCase()
  }
}
