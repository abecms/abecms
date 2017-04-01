import xss from 'xss'
import crypto from 'crypto'

export function replaceUnwantedChar(str, additionnalChar = null) {
  var chars = {'’': '', '\'': '', '"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y'}
  for(var prop in chars) str = str.replace(new RegExp(prop, 'g'), chars[prop])
  if(additionnalChar != null) for(var prop in additionnalChar) str = str.replace(new RegExp(prop, 'g'), additionnalChar[prop])
  return str
}

export function checkXss(newUser) {
  var newUserStr = JSON.stringify(newUser)
  var testXSS = xss(newUserStr.replace(/[a-zA-Z0-9-]*?=\\[\"\'].*?[\"\']/g, ''), {
    whiteList: [],
    stripIgnoreTag: true,
    // stripIgnoreTagBody: ['script']
  })
  if(testXSS !== newUserStr){
    return {
      success:0,
      message: 'invalid characters'
    }
  }
  return {
    success:1
  }
}

/**
* MD5 hashes the specified string.
* @param  {String} str A string to hash.
* @return {String}     The hashed string.
*/
export function md5(str) {
  str = str.toLowerCase().trim()
  return crypto.createHash("md5").update(str).digest("hex");
}
