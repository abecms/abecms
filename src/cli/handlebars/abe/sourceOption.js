import sourceAttr from "./sourceAttr"

export default function sourceOption(val, params) {
  var attr = sourceAttr(val, params)
  return `<option value='${attr.hiddenVal}' ${attr.selected}>${attr.val}</option>`
}
