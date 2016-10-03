import {parse} from 'node-sqlparser'
import {Promise} from 'es6-promise'
import path from 'path'
import {
  config,
  Manager,
  FileParser,
  getAttr
} from '../../'

export default class Sql {

  constructor() {

  }

  static cleanRequest(str, jsonPage) {
    var matchFrom = /from .(.*?) /
    var matchVariable = /{{([a-zA-Z]*)}}/

    var matchFromExec = matchFrom.exec(str)
    if(typeof matchFromExec !== 'undefined' && matchFromExec !== null
      && typeof matchFromExec[1] !== 'undefined' && matchFromExec[1] !== null) {

      var fromMatch
      var toReplace = matchFromExec[1]
      while (fromMatch = matchVariable.exec(toReplace)) {
        try {
          var value = eval('jsonPage.' + fromMatch[1])
          if(typeof value !== 'undefined' && value !== null) {
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

  static handleSqlRequest(str, jsonPage) {
    var cleanRequest = Sql.cleanRequest(str, jsonPage)
    var request = parse(cleanRequest)
    var reconstructSql = ''

    // SQL TYPE
    var type = ''
    if(typeof request.type !== 'undefined' && request.type !== null) {
      type = request.type
    }
    reconstructSql += `${type} `

    // SQL COLUMNS
    var columns = []
    if(typeof request.columns !== 'undefined' && request.columns !== null) {
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
    if(typeof request.from !== 'undefined' && request.from !== null) {

      Array.prototype.forEach.call(request.from, (item) => {
        from.push(item.table)
      })
    }else {
      from.push('*')
    }
    reconstructSql += `from ${JSON.stringify(from)} `

    var where
    if(typeof request.where !== 'undefined' && request.where !== null) {
      where = request.where
      // where = Sql.recurseWhere(request.where)
      // reconstructSql += 'where '
      // Array.prototype.forEach.call(where, (w) => {
      //   reconstructSql += `${w.operator} ${w.left} ${w.compare} ${w.right} `
      // })
    }

    var limit = -1
    if(typeof request.limit !== 'undefined' && request.limit !== null) {
      limit = request.limit[request.limit.length - 1].value
    }

    var orderby
    if(typeof request.orderby !== 'undefined' && request.orderby !== null && request.orderby.length > 0) {
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

  static sortByDateDesc(a, b) {
    var dateA = new Date(a.date)
    var dateB = new Date(b.date)
    if(dateA < dateB) {
      return 1
    }else if(dateA > dateB) {
      return -1
    }
    return 0
  }

  static shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }

    return array
  }

  static sortByDateAsc(a, b) {
    var dateA = new Date(a.date)
    var dateB = new Date(b.date)
    if(dateA > dateB) {
      return 1
    }else if(dateA < dateB) {
      return -1
    }
    return 0
  }

  static getDataSource(str) {
    var res = str.substring(str.indexOf('source=') + 8, str.length)

    var reg = /([^'"]*=[\s\S]*?}})/g
    var matches = res.match(reg)
    if(typeof matches !== 'undefined' && matches !== null) {
      Array.prototype.forEach.call(matches, (match) => {
        res = res.replace(match, '')
      })
    }else {
      res = res.replace('}}', '')
    }

    return res.substring(0, res.length-1)
  }

  /**
   * replaces escaped characters with the right ones
   * @param  {String} statement the from clause
   * @return {String}           the from sanitized
   */
  static sanitizeFromStatement(statement){
    var from = ''

    if(typeof statement !== 'undefined' && statement !== null) {
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
  static getFromDirectory(statement, tplPath){
    var pathFromDir = ''
    if(typeof tplPath === 'undefined' || tplPath === null || tplPath === ''){
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

  static executeOrderByClause(files, orderby){
    if(typeof orderby !== 'undefined' && orderby !== null) {
      if(orderby.column.toLowerCase() === 'random') {
        Sql.shuffle(files)
      }else if(orderby.column.toLowerCase() === 'date') {
        if(orderby.type === 'ASC') {
          files.sort(Sql.sortByDateAsc)
        }else if(orderby.type === 'DESC') {
          files.sort(Sql.sortByDateDesc)
        }
      }
    }

    return files
  }

  static executeFromClause(statement, pathFromClause){
    var from = Sql.sanitizeFromStatement(statement)

    // if the from clause ends with a dot, we won't recurse the directory analyze
    if(from.slice(-1) === '.'){
      from = from.slice(0, -1)
    }
    
    var fromDirectory = Sql.getFromDirectory(from, pathFromClause)

    var list = Manager.instance.getList()
    var files_array = list.filter((element, index) => {
      if(element.publish) {
        if (element.path.indexOf(fromDirectory) > -1) {
          return true
        }
      }
      return false
    })
    return files_array
  }

  static execQuery(pathQuery, match, jsonPage) {
    var res
    var files
    var request = Sql.handleSqlRequest(getAttr(match, 'source'), jsonPage)

    files = Sql.executeFromClause(request.from, pathQuery)
    files = Sql.executeOrderByClause(files, request.orderby)
    res = Sql.executeWhereClause(files, request.where, request.limit, request.columns, jsonPage)

    return res
  }

  static executeQuerySync(pathQuerySync, match, jsonPage) {
    return Sql.execQuery(pathQuerySync, match, jsonPage)
  }

  static executeQuery(pathexecuteQuery, match, jsonPage) {
    var p = new Promise((resolve) => {
      var res = Sql.execQuery(pathexecuteQuery, match, jsonPage)
      resolve(res)
    }).catch(function(e) {
      console.error(e)
    })

    return p
  }

  /**
   * check if a given string an url, string json, file url, abe sql request
   * 
   * Sql.get('http://google.com')
   * Sql.get('{"test":"test"}')
   * Sql.get('select * from ../')
   * Sql.get('test')
   * 
   * @param  {String} str 
   * @return {String} url | request | value | file | other
   */
  static getSourceType(str) {
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

  static executeWhereClause(files, wheres, maxLimit, columns, jsonPage){
    var res = []
    var limit = 0

    for(let file of files) {
      if(limit < maxLimit || maxLimit === -1) {
        if(typeof wheres !== 'undefined' && wheres !== null) {

          if(Sql.recurseWhere(wheres, file.publish, jsonPage)) {
            var json = JSON.parse(JSON.stringify(file.publish))
            var jsonValues = {}

            if(typeof columns !== 'undefined' && columns !== null && columns.length > 0 && columns[0] !== '*') {
              
              Array.prototype.forEach.call(columns, (column) => {
                if(typeof json[column] !== 'undefined' && json[column] !== null) {
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

  static getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc) {
    var value
    var compare

    if((where.left.column === 'template' || where.left.column === 'abe_meta.template')
      && typeof jsonDoc['abe_meta'] !== 'undefined' && jsonDoc['abe_meta'] !== null) {
      value = FileParser.getTemplate(jsonDoc['abe_meta'].template)
    }else {
      try {
        value = eval('jsonDoc.' + where.left.column)
      }catch(e) {
        // console.log('e', e)
      }
    }
    compare = where.right.column

    var matchVariable = /^{{(.*)}}$/.exec(compare)
    if(typeof matchVariable !== 'undefined' && matchVariable !== null && matchVariable.length > 0) {
      try {
        var shouldCompare = eval('jsonOriginalDoc.' + matchVariable[1])
        if(typeof shouldCompare !== 'undefined' && shouldCompare !== null) {
          compare = shouldCompare
        }else {
          compare = null
        }
      }catch(e) {
        compare = null
        // console.log('e', e)
      }
    }

    return {
      left: value,
      right: compare
    }
  }

  static recurseWhere(where, jsonDoc, jsonOriginalDoc) {
    var shouldAdd = true
    var isNotLeftCorrect = false
    var isNotRightCorrect = false
    var isNotCorrect = false

    switch(where.operator) {
    case '=':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      if(values.left !== values.right) {
        isNotCorrect = true
      }
      break
    case '!=':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      if(values.left === values.right) {
        isNotCorrect = true
      }
      break
    case '>':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      isNotCorrect = (values.left > values.right)
      break
    case '>=':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      isNotCorrect = (values.left >= values.right)
      break
    case '<':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      isNotCorrect = (values.left < values.right)
      break
    case '<=':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      isNotCorrect = (values.left <= values.right)
      break
    case 'LIKE':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      if(values.left && values.left.indexOf(values.right) === -1) {
        isNotCorrect = true
      }
      break
    case 'NOT LIKE':
      var values = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      if(values.left && values.left.indexOf(values.right) > -1) {
        isNotCorrect = true
      }
      break
    case 'AND':
      isNotLeftCorrect = Sql.recurseWhere(where.left, jsonDoc, jsonOriginalDoc)
      isNotRightCorrect = Sql.recurseWhere(where.right, jsonDoc, jsonOriginalDoc)
      isNotCorrect = isNotLeftCorrect && isNotRightCorrect
      break
    case 'OR':
      isNotLeftCorrect = Sql.recurseWhere(where.left, jsonDoc, jsonOriginalDoc)
      isNotRightCorrect = Sql.recurseWhere(where.right, jsonDoc, jsonOriginalDoc)
      isNotCorrect = isNotLeftCorrect || isNotRightCorrect
      break
    case 'IN':
      var valuesLeft = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      Array.prototype.forEach.call(where.right.value, (right) => {
        if(valuesLeft.left === right.column) {
          isNotCorrect = true
        }
      })
      break
    case 'NOT IN':
      var valuesLeft = Sql.getWhereValuesToCompare(where, jsonDoc, jsonOriginalDoc)
      isNotCorrect = true
      Array.prototype.forEach.call(where.right.value, (right) => {
        if(valuesLeft.left === right.column) {
          isNotCorrect = false
        }
      })
      break
    }
    return isNotCorrect
  }
}