import path from 'path'
import recursiveFolder from './recursiveFolder'

export default function folders(obj, index, link, translate) {
  var res
  if (obj.length > 0) {
	  if(link != null && link !== 'null') {
	    var links = link.replace(/^\//, '').split(path.sep)
	    links.pop()
	    res = recursiveFolder(obj, 1, '', links, false, translate)
	  }else {
	    res = recursiveFolder(obj, 1, '', null, false, translate)
	  }
  }
  return res
}
