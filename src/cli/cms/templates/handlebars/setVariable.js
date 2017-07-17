/**
 * Handlebars helper, to add variable inside template file
 */
export default function setVariable(varName, varValue, options) {
  if (varValue === 'true') {
    varValue = true
  }
  if (varValue === 'false') {
    varValue = false
  }
  if (typeof varValue == 'string' && varValue.indexOf('{') > -1) {
    varValue = JSON.parse(varValue)
  }

  options.data.root[varName] = varValue
}
