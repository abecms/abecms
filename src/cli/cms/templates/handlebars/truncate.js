export default function truncate(str, len) {
  if (typeof str !== 'undefined' && str != null) {
    if(str.length > len) {
      var new_str = str.substr (0, len)

      return new_str +'...'
    } else {
      return str;
    }
  } else {
    
    return ''
  }
}
