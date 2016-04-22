import extend from 'extend'
import loremIpsum from 'lorem-ipsum'
import clc from 'cli-color'
import {parse} from 'node-sqlparser'
import fse from 'fs-extra'
import requestAjax from 'request'
import ajaxRequest from 'ajax-request'
import {Promise} from 'es6-promise'

import {
  config,
  cli,
  log,
  folderUtils,
  fileUtils,
  FileParser,
  Util,
  fileAttr,
  getAttr
} from '../'

export default class Sql {

  constructor() {

  }

  static recurseWhere(where, operator = '') {
    var arr = []
    var obj = {}
    var operatorLeft = operator
    var operatorRight = operator

    if(typeof where.left !== 'undefined' && where.left !== null
      && typeof where.right !== 'undefined' && where.right !== null
      && typeof where.operator !== 'undefined' && where.operator !== null) {
      // SQL WHERE
      
      if(typeof where.left.column !== 'undefined' && where.left.column !== null
        && typeof where.right.column !== 'undefined' && where.right.column !== null
        && typeof where.operator !== 'undefined' && where.operator !== null) {
        obj.left = where.left.column
        obj.right = where.right.column
        obj.compare = where.operator
        obj.operator = operator
        arr.push(obj)
      }else if(typeof where.left.column !== 'undefined' && where.left.column !== null
        && typeof where.right.value !== 'undefined' && where.right.value !== null
        && typeof where.operator !== 'undefined' && where.operator !== null) {
        obj.left = where.left.column
        obj.right = where.right.value
        obj.compare = where.operator
        obj.operator = operator
        arr.push(obj)
      }else {
        if(typeof where.left.left !== 'undefined' && where.left.left !== null) {
          if(typeof where.left.left.type !== 'undefined' && where.left.left.type !== null) {
            operator = where.operator
          }
        }
      }

      if(typeof where.left.left !== 'undefined' && where.left.left !== null) {
        arr = arr.concat(Sql.recurseWhere(where.left, operator))
      }

      if(typeof where.right.right !== 'undefined' && where.right.right !== null) {
        arr = arr.concat(Sql.recurseWhere(where.right, operator))
      }
    }

    return arr
  }

  static cleanRequest(str) {
    var from = /from ([\S\s]+)/.exec(str)

    var matches = from
    if(matches[1]) {
      var res = matches[1];

      var splitAttr = [' where ', ' order by ', ' limit ', ' WHERE ', ' ORDER BY ', ' LIMIT ']
      for(var i = 0; i < splitAttr.length; i++) {
          if(res.indexOf(splitAttr[i]) > -1) {
              res = res.substring(0, res.indexOf(splitAttr[i]))
          }
      }
      var escapedFrom = res.replace(/\//g, '___abe___')
      escapedFrom = escapedFrom.replace(/\./g, '___abe_dot___')
      str = str.replace(res, escapedFrom)
    }

    return str
  }

  static handleSqlRequest(str) {
    var request = parse(Sql.cleanRequest(str))
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
      where = Sql.recurseWhere(request.where)
      reconstructSql += 'where '
      Array.prototype.forEach.call(where, (w) => {
        reconstructSql += `${w.operator} ${w.left} ${w.compare} ${w.right} `
      })
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
    var jsonA = FileParser.getJson(a.path)
    var jsonB = FileParser.getJson(b.path)
    let metaA = config.meta.name
    let metaB = config.meta.name

    var dateA = (jsonA[metaA]) ? new Date(jsonA[metaA].latest.date) : new Date()
    var dateB = (jsonB[metaB]) ? new Date(jsonB[metaB].latest.date) : new Date()
    if(dateA < dateB) {
      return 1
    }else if(dateA > dateB) {
      return -1
    }
    return 0
  }

  static sortByDateAsc(a, b) {
    var jsonA = FileParser.getJson(a.path)
    var jsonB = FileParser.getJson(b.path)
    let metaA = config.meta.name
    let metaB = config.meta.name
    var dateA = new Date(jsonA[metaA].latest.date)
    var dateB = new Date(jsonB[metaB].latest.date)
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
      Array.prototype.forEach.call(matches, (matche) => {
        res = res.replace(matche, '')
      })
    }else {
      res = res.replace('}}', '')
    }

    return res.substring(0, res.length-1)
  }

  static getDataRequest(tplPath, match, jsonPage) {
    var request = Sql.handleSqlRequest(getAttr(match, 'source')),
        limit = 0,
        res = []

    let data = config.data.url
    var files = []

    if(typeof request.from !== 'undefined' && request.from !== null) {
      Array.prototype.forEach.call(request.from, (from) => {
        from = from.replace(/___abe_dot___/g, '.')
        from = from.replace(/___abe___/g, '/')
        var fromPath = ''
        if(from === '*' || from === '/') {
          fromPath = fileUtils.concatPath(config.root, data)
        }else if(from.indexOf('/') === 0) {
          fromPath = fileUtils.concatPath(config.root, data, from)
        }else if(from.indexOf('/') !== 0) {
          fromPath = fileUtils.concatPath(config.root, data, tplPath, from)
        }

        if(folderUtils.isFolder(fromPath)) {
          files = files.concat(FileParser.getFiles(fromPath, true, 99, /\.json/))
        }
      })
    }else {
      files = FileParser.getFiles(fileUtils.concatPath(config.root, data), true, 99, /\.json/)
    }

    if(typeof request.orderby !== 'undefined' && request.orderby !== null) {
      if(request.orderby.column.toLowerCase() === 'date') {
        if(request.orderby.type === 'ASC') {
          files.sort(Sql.sortByDateAsc)
        }else if(request.orderby.type === 'DESC') {
          files.sort(Sql.sortByDateDesc)
        }
      }
    }

    Array.prototype.forEach.call(files, (file) => {
      var shouldAdd = true
      var folderPath = folderUtils.getFolderPath(file.path)
      var json

      // remove not published file
      var attr = fileAttr.get(file.path)
      if(typeof attr.d !== 'undefined' && attr.d !== null) {
        return;
      }

      // check from
      if(typeof request.where !== 'undefined' && request.where !== null) {
        shouldAdd = Sql.reqWhere(file, request.where, jsonPage)
      }

      if(shouldAdd) {
        if(typeof json === 'undefined' || json === null) {
          json = JSON.parse(JSON.stringify(FileParser.getJson(file.path)))
        }
        var jsonValues = {}

        if(typeof request.columns !== 'undefined' && request.columns !== null && request.columns.length > 0 && request.columns[0] !== '*') {
          Array.prototype.forEach.call(request.columns, (column) => {
            if(typeof json[column] !== 'undefined' && json[column] !== null) {
              jsonValues[column] = json[column]
            }
          })
          jsonValues[config.meta.name] = json[config.meta.name]

        }else {
          jsonValues = json
        }

        if(limit < request.limit || request.limit === -1) {
          res.push(jsonValues)
        }
        limit++
      }
    })

    return res
  }

  static getSourceType(str) {
    if(/http:\/\/|https:\/\//.test(str)) {
      return 'url'
    }

    if(/select[\S\s]*?from/.test(str)) {
      return 'request'
    }

    if(/[\{|\[][[\S\s]*?[\{|\]]/.test(str)) {
      return 'value'
    }

    if(/\.json/.test(str)) {
      return 'file'
    }

    return 'other'
  }

  static deep_value(obj, path) {

    if(path.indexOf('.') === -1) {
      return (typeof obj[path] !== 'undefined' && obj[path] !== null) ? obj[path] : null
    }

    var pathSplit = path.split('.')
    var res = JSON.parse(JSON.stringify(obj))
    for (var i = 0; i < pathSplit.length; i++) {
      if(typeof res[pathSplit[i]] !== 'undefined' && res[pathSplit[i]] !== null) {
        res = res[pathSplit[i]]
      }else {
        return null
      }
    }

    return res
  }

  static deep_value_array(obj, path) {

    if(path.indexOf('.') === -1) {
      return (typeof obj[path] !== 'undefined' && obj[path] !== null) ? obj[path] : null
    }

    var pathSplit = path.split('.')
    var res = JSON.parse(JSON.stringify(obj))

    while(pathSplit.length > 0) {
      
      if(typeof res[pathSplit[0]] !== 'undefined' && res[pathSplit[0]] !== null) {
        if(typeof res[pathSplit[0]] === 'object' && Object.prototype.toString.call(res[pathSplit[0]]) === '[object Array]') {
          var resArray = []

          Array.prototype.forEach.call(res[pathSplit[0]], (item) => {
            resArray.push(Sql.deep_value_array(item, pathSplit.join('.').replace(`${pathSplit[0]}.`, '')))
          })
          res = resArray
          pathSplit.shift()
        }else {
          res = res[pathSplit[0]]
        }
      }else {
        return null
      }
      pathSplit.shift()
    }

    return res
  }

  static reqWhere(file, wheres, jsonPage) {
    var shouldAdd = true
    var json = fse.readJsonSync(file.path)
    let meta = config.meta.name

    if(typeof json[meta] !== 'undefined' && json[meta] !== null) {
      var template = FileParser.getTemplate(json[meta].template)
      Array.prototype.forEach.call(wheres, (where) => {
        var value
        var compare

        if(where.left === 'template') {
          value = FileParser.getTemplate(json[meta].template)
        }else {
          value = Sql.deep_value_array(json, where.left)
        }
        compare = where.right

        var matchVariable = /^{{(.*)}}$/.exec(compare)
        if(typeof matchVariable !== 'undefined' && matchVariable !== null && matchVariable.length > 0) {
          var shouldCompare = Sql.deep_value_array(jsonPage, matchVariable[1])
          if(typeof shouldCompare !== 'undefined' && shouldCompare !== null) {
            compare = shouldCompare
          }else {
            shouldAdd = false
          }
        }

        if(typeof value !== 'undefined' && value !== null) {
          switch(where.compare) {
            case '=':
              if(where.left === 'template') {
                if(value.indexOf('/') > -1 && value !== compare) {
                  shouldAdd = false
                }else if(value.indexOf('/') === -1 && compare.indexOf(value) === -1) {
                  shouldAdd = false
                }

              }else {

                // if both entries are Array
                var foundOne = false
                if(typeof compare === 'object' && Object.prototype.toString.call(compare) === '[object Array]'
                  && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
                  
                  Array.prototype.forEach.call(value, (v) => {
                    if(compare.includes(v)) {
                      foundOne = true
                    }
                  })
                }else if(typeof compare === 'object' && Object.prototype.toString.call(compare) === '[object Array]') { // only "compare" is Array
                  if(compare.includes(value)) {
                    foundOne = true
                  }
                }else if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') { // only "value" is Array
                  if(value.includes(compare)) {
                    foundOne = true
                  }
                }else if(value == compare) { // only none is Array
                  foundOne = true
                }

                if(!foundOne) {
                  shouldAdd = false
                }
              }
              break;
            case '!=':
              if(where.left === 'template') {

                if (value.indexOf('/') > -1 && value === compare) { 
                  shouldAdd = false; 
                } else if (value.indexOf('/') === -1 && compare.indexOf(value) !== -1) { 
                  shouldAdd = false
                }

              }else {

                // if both entries are Array
                var foundOne = false
                if(typeof compare === 'object' && Object.prototype.toString.call(compare) === '[object Array]'
                  && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
                  
                  Array.prototype.forEach.call(value, (v) => {
                    if(compare.includes(v)) {
                      foundOne = true
                    }
                  })
                }else if(typeof compare === 'object' && Object.prototype.toString.call(compare) === '[object Array]') { // only "compare" is Array
                  if(compare.includes(value)) {
                    foundOne = true
                  }
                }else if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') { // only "value" is Array
                  if(value.includes(compare)) {
                    foundOne = true
                  }
                }else if(value === compare) { // only none is Array
                  foundOne = true
                }

                if(foundOne) {
                  shouldAdd = false
                }
              }
              break;
            case 'LIKE':
              if(where.left === 'template') {

                if(value.indexOf(compare) === -1) {
                  shouldAdd = false
                }

              }else {

                // if both entries are Array
                var foundOne = false
                if(typeof compare === 'object' && Object.prototype.toString.call(compare) === '[object Array]'
                  && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
                  
                  Array.prototype.forEach.call(compare, (v) => {
                    Array.prototype.forEach.call(value, (v2) => {
                      if(v.indexOf(v2) !== -1) {
                        foundOne = true
                      }
                    })
                  })
                }else if(typeof compare === 'object' && Object.prototype.toString.call(compare) === '[object Array]') { // only "compare" is Array
                  Array.prototype.forEach.call(compare, (v) => {
                    if(v.indexOf(value) !== -1) {
                      foundOne = true
                    }
                  })
                }else if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') { // only "value" is Array
                  Array.prototype.forEach.call(value, (v) => {
                    if(compare.indexOf(v) !== -1) {
                      foundOne = true
                    }
                  })
                }else if(value === compare) { // only none is Array
                  if(value.indexOf(compare) !== -1) {
                    foundOne = true
                  }
                }

                if(foundOne) {
                  shouldAdd = false
                }
              }

              break;
            default:
              break;
          }
        }else {
          shouldAdd = false
        }
      })
    }else {
      shouldAdd = false
    }

    return shouldAdd
  }
}