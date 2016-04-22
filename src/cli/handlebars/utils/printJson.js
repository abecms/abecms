
/**
 * Handlebars helper, to print json object
 */
export default function printJson(obj, escapeString) {
  return (typeof escapeString !== null && escapeString !== null && escapeString === 1) ?
						escape(JSON.stringify(obj).replace(/'/g, "%27")) :
						JSON.stringify(obj).replace(/'/g, "%27")

}
