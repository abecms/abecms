import path from 'path'
import fse from 'fs-extra'
import {execFile} from 'child_process'
import {
  fileUtils,
  FileParser,
  Util,
  Sql,
  cleanSlug,
  getTemplate,
  save,
  config,
  log,
  Hooks,
  removeDuplicateAttr,
  Manager
} from '../../cli'

var traverseFileSystem = function (currentPath, arr) {
  var res = []
  var files = fse.readdirSync(currentPath);
  for (var i in files) {
    var currentFile = currentPath + '/' + files[i]
    var stats = fse.statSync(currentFile)
    if (stats.isFile()) {
      if (currentFile.indexOf(config.files.templates.extension) > -1) {
        res.push(currentFile)
      }
    }
    else if (stats.isDirectory()) {
      res = res.concat(traverseFileSystem(currentFile))
    }
  }
  return res
};

var findTemplates = function(templatesPath) {
  var p = new Promise((resolve, reject) => {
    let templatesList = traverseFileSystem(templatesPath)
    resolve(templatesList)
  })

  return p
}

/**
 * Get columns and where.left ids of a select statement
 *
 * select title, image from ../ where template=""
 *
 * return [title, image, template]
 * 
 * @param  {Array} templatesList ["article.html", "other.html"]
 * @return {Promise}
 */
var findRequestColumns = function(templatesList) {
  var whereKeysCheck = {}
  var whereKeys = []
  var p = new Promise((resolve, reject) => {
    let util = new Util()
    Array.prototype.forEach.call(templatesList, (file) => {
      var template = fse.readFileSync(file, 'utf8')
      var matches = util.dataRequest(template)

      Array.prototype.forEach.call(matches, (match) => {
        var obj = Util.getAllAttributes(match[0], {})
        obj = Util.sanitizeSourceAttribute(obj, {})
        
        var type = Sql.getSourceType(obj.sourceString)

        switch (type) {
          case 'request':
            var request = Sql.handleSqlRequest(obj.sourceString, {})
            Array.prototype.forEach.call(request.columns, (column) => {
              if(typeof whereKeysCheck[column] === 'undefined' || whereKeysCheck[column] === null) {
                whereKeysCheck[column] = true
                whereKeys.push(column)
              }
            })
            Array.prototype.forEach.call(request.where, (where) => {
              if(typeof whereKeysCheck[where.left] === 'undefined' || whereKeysCheck[where.left] === null) {
                whereKeysCheck[where.left] = true
                whereKeys.push(where.left)
              }
            })
        }
        resolve(whereKeys)
      })
    })
  })

  return p
}

var getSelectTemplateKeys = function(templatesPath) {
  var p = new Promise((resolve, reject) => {
    findTemplates(templatesPath)
      .then((templatesList) => {

        findRequestColumns(templatesList)
          .then((whereKeys) => {
              
              resolve(whereKeys)
          },
          () => {
            console.log('findRequestColumns reject')
            reject()
          })
          .catch((e) => {
            console.error('getSelectTemplateKeys', e)
            reject()
          })
      },
      () => {
        console.log('findTemplates reject')
        reject()
      })
      .catch((e) => {
        console.error('getSelectTemplateKeys', e)
        reject()
      })

    })

    return p
}

export default getSelectTemplateKeys