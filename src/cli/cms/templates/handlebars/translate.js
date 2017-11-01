import {coreUtils} from '../../../'
import Handlebars from 'handlebars'

function getVariable(variable, json, options) {
  if (variable.indexOf('{{') > -1) {
    var template = Handlebars.compile(variable)
    var res = template(json)

    if (res === "") {
      template = Handlebars.compile(variable)
      res = template(options.data.root)
    }
    return res
  }else {
    return variable
  }
}

export default function translate(lang, str, json, options) {
  var resLang = getVariable(lang, json, options)
  var resStr = getVariable(str, json, options)

  var trad = coreUtils.locales.instance.i18n
  if(typeof trad[resLang] !== 'undefined' && trad[resLang] !== null
    && typeof trad[resLang][resStr] !== 'undefined' && trad[resLang][resStr] !== null) {
    return trad[resLang][resStr]
  }

  return resStr
}
