/**
 * Handlebars helper, to print className and escape it string
 */
export default function className(str) {
  return str.replace(/\.| |\#/g, '_')
}
