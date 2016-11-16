import Handlebars from 'handlebars'

/**
 * Handlebars helper, remove config.root from array of path
 */
export default function removeRootPath(obj, url, formater) {
  obj = JSON.parse(JSON.stringify(obj).replace(new RegExp(JSON.parse(url).root, 'g'), ''))
  obj = Handlebars.helpers[formater](obj)
	
  return obj
}
