import sourceAttr from './sourceAttr'

export default function sourceAutocomplete(val, params) {
  var attr = sourceAttr(val, params)

  return `<div class="autocomplete-result" value='${attr.hiddenVal}' data-parent-id='${params.key}' ${attr.selected}>
    ${attr.val}
    <span class="glyphicon glyphicon-remove" data-autocomplete-remove="true"></span>
  </div>`
}
