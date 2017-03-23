import {coreUtils} from '../../../'

export default function cleanTab(obj) {
  obj = coreUtils.text.replaceUnwantedChar(obj.replace(/ |&/g, '_'), {'\\(': '', '\\)': '', '\\[': '', '\\]': ''})

  return obj
}
