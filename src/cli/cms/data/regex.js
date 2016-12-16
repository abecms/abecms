export let abeTag = /({{abe.*?[\s\S].*?}})/g
// 
export let abePattern = /[^"']({{abe.*?type=[\'|\"][text|rich|textarea]+[\'|\"][\s\S].*?}})/g
// This pattern finds all abe tags enclosed in a HTML tag attribute
// export let abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1}{{abe.*?}})/g;
// export let abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1})(.*?)({{abe.*?}})/g
export let abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1})([^=]*?)({{abe.*?["|'| ]}})["|']/g
// This pattern finds all {{#each ...}}...{{/each}} blocks
// export let eachBlockPattern = />\s*(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g;
export let eachBlockPattern = /(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g
// This pattern finds all {{#each ...}}...{{/each}} blocks
export let blockPattern = /(\{\{#each.*\}\}[\s\S]*?\{\{\/each\}\})/g

/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
export function getAttr (str, attr) {
  var rex = new RegExp(attr + '=["|\']([\\S\\s]*?)["|\']( +[a-zA-Z0-9-]*?=|}})')
  var res = rex.exec(str)
  res = (res != null && res.length > 1) ? res[1] : ''
  return res
}

/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
export function getAllAbeHtmlTag (str) {
  var res = []

  var matches = str.match(abePattern)
  Array.prototype.forEach.call(matches, (match) => {
    res.push(match)
  })

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

/**
 * Test if a string don't contains string key from ABE block statement
 * @param  {String}  str string to test
 * @return {Boolean} true = this is not a block content
 */
export function getEachParentKey(str){
  return getAttr(str, 'key').split('.')[0]
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

/**
 */
export function getTagAbeWithType(text, type) {
  var listReg = new RegExp(`({{abe.*type=[\\'|\\"]${type}.*}})`, 'g')
  var matches = []
  var match
  while (match = listReg.exec(text)) {
    matches.push(match[0])
  }
  return matches
}

/**
 */
export function getTagAbeWithTab(text, tab) {
  var listReg = new RegExp(`({{abe.*tab=[\\'|\\"]${tab}.*}})`, 'g')
  var matches = []
  var match
  while (match = listReg.exec(text)) {
    matches.push(match[0])
  }
  return matches
}

export function validDataAbe(str){
  return str.replace(/\[([0-9]*)\]/g, '$1')
}

export function getWorkflowFromOperationsUrl(str){
  let regUrl = /\/abe\/operations\/(.*?)\/(.*?)\//
  var workflow = 'draft'
  var match = str.match(regUrl)
  if (match != null && match[2] != null) {
    workflow = match[2]
  }
  var postUrl = str.replace(regUrl, '')
  return {
    workflow: workflow,
    postUrl: postUrl
  }
}