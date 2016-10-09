import {coreUtils} from '../../../'

export default function translate(lang, str) {
  var trad = coreUtils.locales.instance.i18n
  if(typeof trad[lang] !== 'undefined' && trad[lang] !== null
    && typeof trad[lang][str] !== 'undefined' && trad[lang][str] !== null) {
    return trad[lang][str]
  }
  return str
}
