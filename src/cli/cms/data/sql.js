import {parse} from 'node-sqlparser'
import {Promise} from 'bluebird'
import path from 'path'
import {
  coreUtils,
  config,
  Manager,
  cmsData
} from '../../'

/**
 * take a string and json to escape sql character and convert to sql like syntax
 *
 * Example: escapeAbeValuesFromStringRequest('select title from ./ where `abe_meta.template`=`{{article}}`', {article: "test"})
 *
 * Return string: select title from ___abe_dot______abe_dot______abe___ where  `abe_meta.template`=`test`
 * 
 * 
 * @param  {String} str      raw abe request sql string
 * @param  {Object} jsonPage json object of post
 * @return {String}          escaped string
 */
export function escapeAbeValuesFromStringRequest(str, jsonPage) {
  var matchFrom = /from .(.*?) /
  var matchVariable = /{{([a-zA-Z]*)}}/

  var matchFromExec = matchFrom.exec(str)
  if(matchFromExec != null && matchFromExec[1] != null) {

    var fromMatch
    var toReplace = matchFromExec[1]
    while (fromMatch = matchVariable.exec(toReplace)) {
      try {
        var value = eval('jsonPage.' + fromMatch[1])
        if(value != null) {
          toReplace = toReplace.replace('{{' + fromMatch[1] + '}}', value)
        }else {
          toReplace = toReplace.replace('{{' + fromMatch[1] + '}}', '')
        }
      }catch(e) {
      }
    }

    str = str.replace(matchFromExec[1], toReplace)
  }

  var from = /from ([\S\s]+)/.exec(str)

  var matches = from
  if(matches[1]) {
    var res = matches[1]
    var splitAttr = [' where ', ' order by ', ' limit ', ' WHERE ', ' ORDER BY ', ' LIMIT ']
    for(var i = 0; i < splitAttr.length; i++) {
      if(res.indexOf(splitAttr[i]) > -1) {
        res = res.substring(0, res.indexOf(splitAttr[i]))
      }
    }
    var escapedFrom = res.replace(/\//g, '___abe___')
    escapedFrom = escapedFrom.replace(/\./g, '___abe_dot___')
    escapedFrom = escapedFrom.replace(/-/g, '___abe_dash___')
    str = str.replace(res, escapedFrom)
  }

  str = str.replace(/``/g, '\'\'')

  return str
}

/**
 * analyse and create an object from request sql string
 *
 * Example: handleSqlRequest('select title from ./ where `abe_meta.template`=`{{article}}`', {article: "test"})
 * 
 * @param  {String} str      Sql string request
 * @param  {Object} jsonPage json of post
 * @return {Object}          {type, columns, from, where, string, limit, orderby}
 */
export function handleSqlRequest(str, jsonPage) {
  var req = escapeAbeValuesFromStringRequest(str, jsonPage)
  var request = parse(req)
  var reconstructSql = ''

  // SQL TYPE
  var type = ''
  if(request.type != null) {
    type = request.type
  }
  reconstructSql += `${type} `

  // SQL COLUMNS
  var columns = []
  if(request.columns != null) {
    if(request.columns === '*') {
      columns.push('*')
    }else {
      Array.prototype.forEach.call(request.columns, (item) => {
        columns.push(item.expr.column)
      })
    }
  }
  reconstructSql += `${JSON.stringify(columns)} `

  // SQL FROM
  var from = []
  if(request.from != null) {

    Array.prototype.forEach.call(request.from, (item) => {
      from.push(item.table)
    })
  }else {
    from.push('*')
  }
  reconstructSql += `from ${JSON.stringify(from)} `

  var where = null
  if(request.where != null) {
    where = request.where
  }

  var limit = -1
  if(request.limit != null) {
    limit = request.limit[request.limit.length - 1].value
  }

  var orderby = null
  if(request.orderby != null && request.orderby.length > 0) {
    orderby = {
      column: request.orderby[0].expr.column,
      type: request.orderby[0].type
    }
    reconstructSql += `ORDER BY ${orderby.column} ${orderby.type} `
  }

  return {
    type: type,
    columns: columns,
    from: from,
    where: where,
    string: reconstructSql,
    limit: limit,
    orderby: orderby
  }
}

/**
 * get JSON from abe tag attribute source
 *
 * {{abe type='data' key='titles' desc='select titles' source='[{"title": "rouge", "id": 1},{"title": "vert", "id": 2},{"title": "blue", "id": 3}]' display="{{title}}"}}
 *
 * return 
 * [{"title": "rouge", "id": 1},{"title": "vert", "id": 2},{"title": "blue", "id": 3}]
 * 
 * @param  {String} str abe tag
 * @return {String}     json string
 */
export function getDataSource(str) {
  var reg = /source=(['|"])(.*?)\1[ |\}]/g
  var match = reg.exec(str)
  if (match != null) {
    return match[2]
  }

  return []
}

/**
 * replaces escaped characters with the right ones
 * @param  {String} statement the from clause
 * @return {String}           the from sanitized
 */
export function sanitizeFromStatement(statement){
  var from = ''

  if(statement != null) {
    from = statement[0].replace(/___abe_dot___/g, '.')
    from = from.replace(/___abe___/g, '/')
    from = from.replace(/___abe_dash___/g, '-')
  }

  return from
}

/**
 * calculate the directory to analyze from the from clause
 * @param  {String} statement the from clause
 * @param  {String} tplPath   the path from the template originator
 * @return {string}           the directory to analyze
 */
export function getFromDirectory(statement, tplPath){
  var pathFromDir = ''
  if(!tplPath){
    tplPath = '/'
  }

  if(statement === '' || statement === '*' || statement === '/') {
    pathFromDir = path.join(config.root, config.data.url)
  }else if(statement === './') {
    pathFromDir = path.join(config.root, config.data.url, tplPath)
  }else if(statement.indexOf('/') === 0) {
    pathFromDir = path.join(config.root, config.data.url, statement)
  }else if(statement.indexOf('/') !== 0) {
    pathFromDir = path.join(config.root, config.data.url, tplPath, statement)
  }

  return pathFromDir
}

/**
 * sort array of files from where clause
 *
 * @param  {Array} files
 * @param  {Object} orderby {orderby: {column: 'date'}} | {orderby: {column: 'random', type: 'ASC'}}
 * @return {Array}         sorted array
 */
export function executeOrderByClause(files, orderby){
  if(orderby != null) {
    if(orderby.column.toLowerCase() === 'random') {
      files = coreUtils.sort.shuffle(files)
    }else if(orderby.column.toLowerCase() === 'date') {
      if(orderby.type === 'ASC') {
        files.sort(cmsData.sort.byDateAsc)
      }else if(orderby.type === 'DESC') {
        files.sort(cmsData.sort.byDateDesc)
      }
    }
  }

  return files
}

/**
 * Keep only published post
 *
 * keepOnlyPublishedPost([files])
 *
 * @param  {Array} files      paths
 * @return {Array}                files
 */
export function keepOnlyPublishedPost(files){
  var publishedValue = []
  Array.prototype.forEach.call(files, (file) => {
    if (file.publish != null) {
      publishedValue.push(file.publish)
    }
  })

  return publishedValue
}

/**
 * Check array of files have path that match path statement
 *
 * executeFromClause([array], ['/'], ['/'])
 *
 * @param  {Array} statement      paths
 * @param  {Array} pathFromClause paths
 * @return {Array}                files
 */
export function executeFromClause(files, statement, pathFromClause){
  var from = sanitizeFromStatement(statement)

  // if the from clause ends with a dot, we won't recurse the directory analyze
  if(from.slice(-1) === '.'){
    from = from.slice(0, -1)
  }
  
  var fromDirectory = getFromDirectory(from, pathFromClause)

  var files_array = files.filter((element) => {
    if (element.path.indexOf(fromDirectory) > -1) {
      return true
    }
    return false
  })

  return files_array
}

/**
 * Execute sql query like to find abe json post that match the query
 * 
 * @param  {Array} pathQuery of paths
 * @param  {String} match     request sql
 * @param  {Object} jsonPage  json of post
 * @return {Array}           found object that match
 */
export function execQuery(pathQuery, match, jsonPage) {
  var files = keepOnlyPublishedPost(Manager.instance.getList())
  var request = handleSqlRequest(cmsData.regex.getAttr(match, 'source'), jsonPage)

  files = executeFromClause(files, request.from, pathQuery)
  files = executeWhereClause(files, request.where, request.limit, request.columns, jsonPage)
  files = executeOrderByClause(files, request.orderby)
  return files
}

export function executeQuerySync(pathQuerySync, match, jsonPage) {
  return execQuery(pathQuerySync, match, jsonPage)
}

export function executeQuery(pathexecuteQuery, match, jsonPage) {
  var p = new Promise((resolve) => {
    var res = execQuery(pathexecuteQuery, match, jsonPage)
    resolve(res)
  }).catch(function(e) {
    console.error(e)
  })

  return p
}

/**
 * check if a given string an url, string json, file url, abe sql request
 * 
 * get('http://google.com')
 * get('{"test":"test"}')
 * get('select * from ../')
 * get('test')
 * 
 * @param  {String} str 
 * @return {String} url | request | value | file | other
 */
export function getSourceType(str) {
  if(/http:\/\/|https:\/\//.test(str)) {
    return 'url'
  }

  if(/select[\S\s]*?from/.test(str)) {
    return 'request'
  }

  try {
    JSON.parse(str)
    return 'value'
  }catch(e) {

  }

  if(/\.json/.test(str)) {
    return 'file'
  }

  return 'other'
}

/**
 * return array of post that match sql where statement
 *
 * Example: handleSqlRequest('select title from ./ where `abe_meta.template`=`article`', {})
 *
 * @param  {Array} files    
 * @param  {Object} wheres   clause
 * @param  {Int} maxLimit 
 * @param  {Array} columns  sql
 * @param  {Object} jsonPage json post
 * @return {Array}          of files
 */
export function executeWhereClause(files, wheres, maxLimit, columns, jsonPage){
  if(typeof wheres === 'undefined' || wheres === null) return files
  var res = []
  var limit = 0
  var json = {}
  var jsonValues = {}

  for(let file of files) {
    if(limit < maxLimit || maxLimit === -1) {
      if(wheres != null) {
        if(!recurseWhere(wheres, file, jsonPage)) {
          json = JSON.parse(JSON.stringify(file))
          jsonValues = {}

          if(columns != null && columns.length > 0 && columns[0] !== '*') {
            Array.prototype.forEach.call(columns, (column) => {
              if(json[column] != null) {
                jsonValues[column] = json[column]
              }
            })
            jsonValues['abe_meta'] = json['abe_meta']
          }else {
            jsonValues = json
          }

          res.push(jsonValues)
          limit++
        }
      }
    } else {
      break
    }
  }

  return res
}

/**
 * Compare where left and where right clause
 * 
 * @param  {Object} where           clause
 * @param  {Object} jsonDoc         json of current post
 * @param  {Object} jsonOriginalDoc json of post to compare
 * @return {Object}                 {left: value, right: value}
 */
export function getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc) {
  var regexIsVariable = /^{{(.*)}}$/
  var value = null
  var compare = null

  try {
    var variableLeft = where.left.column
    var whereLeftColumn = where.left.column
    var checkIfLeftIsAVariable = regexIsVariable.exec(variableLeft)
    if(checkIfLeftIsAVariable != null && checkIfLeftIsAVariable.length > 0) {
      variableLeft = checkIfLeftIsAVariable[1]
    }
    value = eval('jsonDoc.' + variableLeft)
  }catch(e) {
    // console.log('e', e)
  }
  
  if(where.operator === 'IN' || where.operator === 'NOT IN') {
    if(value == null) {
      // is the form of variableLeft something like elt.attribute or elt[].attribute?
      // so maybe is elt an array ?
      let arValues = variableLeft.split('.')
      let key = arValues[0]
      if(key.slice(-2) == '[]'){
        key = key.slice(0, -2)
      }
      let records = eval('jsonDoc.' + key)
      whereLeftColumn = arValues[1]
      value = []
      // if yes, value is then an array of values
      if(records != null) {
        Array.prototype.forEach.call(records, (record) => {
          try {
            let val = record[arValues[1]]
            value.push(val)
          } catch (e) {
            console.log(e.stack)
          }
        })
      }
    }
    compare = []
    Array.prototype.forEach.call(where.right.value, (right) => {
      var matchRightVariable = regexIsVariable.exec(right.column)
      if(matchRightVariable != null && matchRightVariable.length > 0) {
        try {
          var jsonOriginalValues = eval('jsonOriginalDoc.' + matchRightVariable[1])
          Array.prototype.forEach.call(jsonOriginalValues, (jsonOriginalValue) => {
            compare.push(eval('jsonOriginalValue.' + whereLeftColumn))
          })
        }catch(e) {}
      }
      else{
        compare.push(right.column)
      }
    })
  } else {
    if(where.right.column != null) {
      compare = where.right.column
    } else if(where.right.value != null) {
      compare = where.right.value
    }

    var matchRightVariable = regexIsVariable.exec(compare)

    if(matchRightVariable != null && matchRightVariable.length > 0) {
      try {
        var shouldCompare = eval('jsonOriginalDoc.' + matchRightVariable[1])
        if(shouldCompare != null) {
          compare = shouldCompare
        }else {
          compare = null
        }
      }catch(e) {
        compare = null
      }
    }
  }

  return {
    left: value,
    right: compare
  }
}

export function isInStatementCorrect(values, isCorrect){
  if( Object.prototype.toString.call(values.left) === '[object Array]' ) {
    Array.prototype.forEach.call(values.left, (left) => {
      Array.prototype.forEach.call(values.right, (right) => {
        if(left != null && left === right) {
          isCorrect = !isCorrect
        }
      })
    })
  } else {
    Array.prototype.forEach.call(values.right, (right) => {
      if(values.left === right) {
        isCorrect = !isCorrect
      }
    })
  }

  return isCorrect
}

/**
 * Check where.left value that match where operator (=, !=, >, >=, <, <=, LIKE, NOT LIKE, AND, OR, IN, NOT IN)
 * if operator AND or OR
 * Recurse on where.left and where.right sql clause
 *
 * 
 * @param  {Object} where           clause
 * @param  {Object} jsonDoc         json of current post
 * @param  {Object} jsonOriginalDoc json of post to compare
 * @return {Boolean}                 true if not matching | false if matching
 */
export function recurseWhere(where, jsonDoc, jsonOriginalDoc) {
  var isNotLeftCorrect = false
  var isNotRightCorrect = false
  var isNotCorrect = false
  var values

  switch(where.operator) {
  case '=':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left === values.right)
    break
  case '!=':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left !== values.right)
    break
  case '>':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left > values.right)
    break
  case '>=':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left >= values.right)
    break
  case '<':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left < values.right)
    break
  case '<=':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left <= values.right)
    break
  case 'LIKE':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left && values.left.indexOf(values.right) > -1)
    break
  case 'NOT LIKE':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = !(values.left && values.left.indexOf(values.right) === -1)
    break
  case 'AND':
    isNotLeftCorrect = recurseWhere(where.left, jsonDoc, jsonOriginalDoc)
    isNotRightCorrect = recurseWhere(where.right, jsonDoc, jsonOriginalDoc)
    isNotCorrect = (isNotLeftCorrect || isNotRightCorrect) ? true : false
    break
  case 'OR':
    isNotLeftCorrect = recurseWhere(where.left, jsonDoc, jsonOriginalDoc)
    isNotRightCorrect = recurseWhere(where.right, jsonDoc, jsonOriginalDoc)
    isNotCorrect = (isNotLeftCorrect && isNotRightCorrect) ? true : false
    break
  case 'IN':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = isInStatementCorrect(values, true)
    break
  case 'NOT IN':
    values = getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
    isNotCorrect = isInStatementCorrect(values, false)
    break
  }

  return isNotCorrect
}