import Handlebars from 'handlebars'

export default function truncate(str, len) {
  if (typeof str !== 'undefined' && str.length > len) {
    new_str = new Handlebars.SafeString (str)
    var new_str = str + ' '
    new_str = str.substr (0, len)
    new_str = str.substr (0, new_str.lastIndexOf(' '))
    new_str = (new_str.length > 0) ? new_str : str.substr (0, len)

    return new_str +'...' 
  } else {
    
    return ''
  }
  
  return new Handlebars.SafeString (str)
}
