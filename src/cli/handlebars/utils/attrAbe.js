import Handlebars from 'handlebars'
import abeEngine from '../abe/abeEngine'

/**
 * Print properties inside html tag
 * @param  {String} attr exemple: atl, title, ...
 * @param  {[type]} value value of the property
 * @return {String} the value to print inside the attribut
 */
export default function attrAbe (attr, value) {
  var content = abeEngine._content
  return new Handlebars.SafeString(value)
}
