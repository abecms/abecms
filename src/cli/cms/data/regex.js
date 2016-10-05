/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
export function getAttr (str, attr) {
  var rex = new RegExp(attr + '=["|\']([\\S\\s]*?)["|\']( +[a-zA-Z0-9-]*?=|}})')
  var res = rex.exec(str)
  res = (typeof res !== null && res !== null && res.length > 1) ? res[1] : ''
  return res
}

/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
export function escapeTextToRegex(str, params) {
  str = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  return new RegExp(str, params)
}

/**
 * Test if a string don't contains string key from ABE block statement
 * @param  {String}  str string to test
 * @return {Boolean} true = this is not a block content
 */
export function isSingleAbe(str, text){
  return  !new RegExp('#each(.)+?' + getAttr(str, 'key').split('.')[0]).test(text) &&
          str.indexOf('{{#') < 0 &&
          str.indexOf('#each') < 0 &&
          str.indexOf('{{/') < 0 &&
          str.indexOf('/each') < 0 &&
          str.indexOf('attrAbe') < 0
}

export function isBlock(str){
  return str.indexOf('[') < 0 && str.indexOf('.') > 0
}

/**
 * Test if a string contains string key from ABE block statement
 * @param  {String}  str string to test
 * @return {Boolean} true = this is a block content
 */
export function isBlockAbe(str) {
  return str.indexOf('abe') > -1 && getAttr(str, 'key').indexOf('.') > -1
}

/**
 * Test if a string contains string key from {{#each}} block statement
 * @param  {String}  str string to test
 * @return {Boolean} true = this is a block content
 */
export function isEachStatement(str) {
  return str.indexOf('#each') > -1 || str.indexOf('/each') > -1
}

/**
 * Test if a string contains string key from {{#each}} block statement
 * @param  {String}  str string to test
 * @return {Boolean} true = this is a block content
 */
export function getTagAbeTypeRequest(text) {
  let listReg = /({{abe.*type=[\'|\"]data.*}})/g
  var matches = []
  var match
  while (match = listReg.exec(text)) {
    matches.push(match)
  }
  return matches
}

export function validDataAbe(str){
  return str.replace(/\[([0-9]*)\]/g, '$1')
}

export function escapeRegExp(str) {
  var specials = [
    // order matters for these
      '-'
    , '['
    , ']'
    // order doesn't matter for any of these
    , '/'
    , '{'
    , '}'
    , '('
    , ')'
    , '*'
    , '+'
    , '?'
    , '.'
    , '\\'
    , '^'
    , '$'
    , '|'
    ]

  // I choose to escape every character with '\'
  // even though only some strictly require it when inside of []
  , regex = RegExp('[' + specials.join('\\') + ']', 'g')
  return str.replace(regex, '\\$&')
}