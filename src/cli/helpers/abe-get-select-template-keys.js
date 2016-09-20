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

var findTemplates = function(templatesPath) {
  var p = new Promise((resolve, reject) => {
    execFile('find', [ templatesPath ], (err, stdout, stderr) => {
        if (err) reject(err)

        var file_list = stdout.split('\n')
        var file_list_with_extention = []
        Array.prototype.forEach.call(file_list, (file) => {
          if (file.indexOf(config.files.templates.extension) > -1) {
            file_list_with_extention.push(file)
          }
        })
        
        resolve(file_list_with_extention)
      });
  })

  return p
}

var findRequestKeys = function(file_list_with_extention) {
  var whereKeysCheck = {}
  var whereKeys = []
  var p = new Promise((resolve, reject) => {
    let util = new Util()
    Array.prototype.forEach.call(file_list_with_extention, (file) => {
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
      .then((file_list_with_extention) => {

        findRequestKeys(file_list_with_extention)
          .then((whereKeys) => {
              
              resolve(whereKeys)
          },
          () => {
            console.log('findRequestKeys reject')
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