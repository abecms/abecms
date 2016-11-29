
/**
 * Handlebars helper, to add variable inside template file
 */
export default function setVariable(varName, varValue, options){
  if (varValue === 'true') {
    varValue = true
  }
  if (varValue === 'false') {
    varValue = false
  }
  options.data.root[varName] = varValue
}