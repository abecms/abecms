import recursiveFolder from './recursiveFolder'

export default function folders(obj, index, link) {
  var res
  if(typeof link !== 'undefined' && link !== null && link !== 'null') {
    var links = link.replace(/^\//, '').split('/')
    links.pop()
    res = recursiveFolder(obj, 1, '', links)
  }else {
    res = recursiveFolder(obj, 1)
  }
  return res
}
