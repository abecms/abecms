
/**
 * Handlebars helper, to print json object
 */
export default function printJson(obj, escapeString) {
  if(typeof obj !== 'undefined' && obj !== null) {
    return (typeof escapeString !== null && escapeString !== null && escapeString === 1) ?
							escape(JSON.stringify(obj).replace(/'/g, '%27')) :
							JSON.stringify(obj).replace(/'/g, '%27')		
  }else {
    return '{}'
  }

}
