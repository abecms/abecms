
/**
 * Handlebars helper, to add variable inside template file
 */
export default function setVariable(varName, varValue, options){
  options.data.root[varName] = varValue
}