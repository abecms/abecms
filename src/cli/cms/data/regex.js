import {config} from '../../'

export function getAbeTags() {
  let abeTags = ''
  Object.keys(config.abeTags).map(function(key, index) {
    abeTags += index > 0 ? '|' + key : key
  })

  return abeTags
}

export let abeTag = /({{abe .*?[\s\S].*?['|"] *}})/g

// export let abePattern = /(--->(\*\/)?{{abe.*?type=[\'|\"][text|rich|textarea|code]+[\'|\"][\s\S].*?}})/g
// export let abeAsTagPattern = /({{abe.*?type=[\'|\"][text|rich|textarea|code]+[\'|\"][\s\S].*?}})/g

// pattern to detect every abe tags
//var patt = /abe [^{{}}]+?(?=\}})/g
export function abePattern() {
  return new RegExp(
    '(--->(\\*\\/)?{{abe .*?type=[\'|"][' +
      getAbeTags() +
      ']+[\'|"][\\s\\S].*?}})',
    'g'
  )
}

export function abeAsTagPattern() {
  return new RegExp(
    '({{abe .*?type=[\'|"][' + getAbeTags() + ']+[\'|"][\\s\\S].*?}})',
    'g'
  )
}

// This pattern finds all abe tags enclosed in a HTML tag attribute
// export let abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1}{{abe.*?}})/g;
// export let abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1})(.*?)({{abe.*?}})/g
export let abeAsAttributePattern = /( [A-Za-z0-9\-\_]+=["|']{1})([^=]*?)({{abe .*?["|'| ]}})["|']/g

// This pattern finds all {{#each ...}}...{{/each}} blocks
export let eachBlockPattern = /(\{\{#each ([\s\S]*?)}}[\s\S]*?\/each\}\})/g

// This pattern finds all non editable data types
export let nonEditableDataReg = /({{abe .*(type=[\'|\"]data')?.*editable=[\'|\"]false.*(type=[\'|\"]data')?.*}})/g

// This pattern finds all data types
//export let dataTypeReg = /({{abe .*?type=[\'|\"]data[\s\S].*?}})/g
export let dataTypeReg = /({{abe .*type=[\'|\"]data.*}})/g
export let dataTypeRegWithComment = /({{abe .*type=[\'|\"]data.*}}"\/ABE--->)/g

/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
export function getAttr(str, attr) {
  var rex = new RegExp(attr + '=["|\']([\\S\\s]*?)["|\']( +[a-zA-Z0-9-]*?=|}})')
  var res = rex.exec(str)
  res = res != null && res.length > 1 ? res[1] : ''
  return res
}

/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
export function getAllAbeHtmlTag(str) {
  var res = []
  var pattern = abePattern()
  var matches = str.match(pattern)
  Array.prototype.forEach.call(matches, match => {
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
 * Not contains {{#each keyName}}
 * nor contains {{#}}
 * nor contains {{/
 * nor contains {{/each
 *
 * @param  {String}  str string to test
 * @return {Boolean} true = this is not a block content
 */
export function isSingleAbe(str, text) {
  return (
    !new RegExp('#each(.)+?' + getAttr(str, 'key').split('.')[0]).test(text) &&
    str.indexOf('{{#') < 0 &&
    str.indexOf('#each') < 0 &&
    str.indexOf('{{/') < 0 &&
    str.indexOf('{{/each') < 0
  )
}

/**
 * Test if a string don't contains string key from ABE block statement
 * @param  {String}  str string to test
 * @return {Boolean} true = this is not a block content
 */
export function getEachParentKey(str) {
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
 * Returns the array of Abe type 'data' tags
 *
 * @param String text (the html template)
 * @return Array of abe tags found
 */
export function getAbeTypeDataList(text) {
  const matches = []
  let match
  while (match = dataTypeReg.exec(text)) {
    matches.push(match[0])
  }

  return matches
}

/**
 */
export function getTagAbeWithType(text, type) {
  var listReg = new RegExp(`({{abe .*type=[\\'|\\"]${type}.*}})`, 'g')
  var matches = []
  var match
  while ((match = listReg.exec(text))) {
    matches.push(match[0])
  }
  return matches
}

export function getTagAbeWithKey(text, key) {
  var listReg = new RegExp(`({{abe .*key=[\\'|\\"]${key}.*}})`, 'g')
  var matches = []
  var match
  while ((match = listReg.exec(text))) {
    matches.push(match[0])
  }
  return matches
}

/**
 */
export function getTagAbeWithTab(text, tab) {
  var listReg = new RegExp(`({{abe .*tab=[\\'|\\"]${tab}.*}})`, 'g')
  var matches = []
  var match
  while ((match = listReg.exec(text))) {
    matches.push(match[0])
  }
  return matches
}

export function getTagAbeWithSource(text) {
  var listReg = new RegExp(`({{abe .*source=[\\'|\\"].*}})`, 'g')
  var matches = []
  var match
  while ((match = listReg.exec(text))) {
    matches.push(match[0])
  }
  return matches
}

export function validDataAbe(str) {
  return str.replace(/\[([0-9]*)\]/g, '$1')
}

export function getWorkflowFromOperationsUrl(str) {
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
