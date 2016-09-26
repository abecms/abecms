import {Util} from "../../"

export default function cleanTab(obj) {
  obj = Util.replaceUnwantedChar(obj.replace(/ |&/g, "_"))

  return obj
}
